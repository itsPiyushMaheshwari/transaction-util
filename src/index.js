const Web3 = require('web3')
const fs = require('fs')
const path = require('path')
const provider = new Web3.providers.HttpProvider('https://matic-mumbai.chainstacklabs.com');
const web3 = new Web3(provider)
web3.eth.accounts.wallet.add("0x<PrivateKey>");

const isConfirmed = async (txHash, blocks) => {
    try {
        const tx = await web3.eth.getTransaction(txHash)
        // console.log('tx', tx)
        if (!tx || !tx.blockNumber) {
            // console.log(`${txHash} is still pending`)
            return false
        }
        const block = await this.web3.eth.getBlock('latest')

        if (block.number - tx.blockNumber >= blocks) {
            return true
        } else {
            // console.log(`current block is at ${block.number} while tx was in ${tx.blockNumber}`)
            return false
        }   
    } catch(e){
        console.log("error in isConfirmed", e)
        return false
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const waitForConfirmation = async (txHash) => {
    try {
        let i = 0
        while (i < 8) {
            if (await isConfirmed(txHash, 64)) {
                console.log(txHash, 'confirmed')
                const receipt = await web3.eth.getTransactionReceipt(txHash)
                if (receipt != null) return receipt
            }
            i += 1
            await sleep(15000)
        }
        
        return null
    } catch(e){
        console.log("error in waitForConfirmation", e)
        return null
    }
}

const handleTransaction = async (address, amount, gasPrice, nonce) => {
    return new Promise((resolve, reject) => {
        const formattedAddress = web3.utils.toChecksumAddress(address)
        web3.eth.sendTransaction({ from: "0xFd71Dc9721d9ddCF0480A582927c3dCd42f3064C", to: formattedAddress, value: amount, gas: 21000, gasPrice: gasPrice, nonce: nonce })
        .on('transactionHash', (transactionHash) => {
            resolve(transactionHash)
        })
        .catch(reject)
    })
}

const sendSingleTransaction = async (address, amount) => {
    // return only when confirmed
    try {
        let gasPrice = 0
        let receipt = null;
        while (!receipt) {
            gasPrice += 20000000000
            const nonce = await web3.eth.getTransactionCount("0xFd71Dc9721d9ddCF0480A582927c3dCd42f3064C")
            console.log(nonce)
            const txHash = await handleTransaction(address, amount, gasPrice, nonce)
            console.log(txHash, gasPrice)
            receipt = await waitForConfirmation(txHash)
        }
        return receipt
    } catch(e) {
        console.log("error in sendSingleTransaction", e)
        return "sendSingleTransactionFailed"
    }
}

const saveReceipt = async (address, receipt) => {
    const resultFile = "result.json"
    const result = JSON.parse(fs.readFileSync(path.resolve(__dirname, resultFile)).toString())
    if (receipt.status == false) {
        result[address] = 'reverted'
        fs.writeFileSync(resultFile, JSON.stringify(result, null, 2)) // Indent 2 spaces
        return
    } else {
        result[address] = receipt.transactionHash
        fs.writeFileSync(path.resolve(__dirname, resultFile), JSON.stringify(result, null, 2)) // Indent 2 spaces
    }
}

const startTransaction = async () => {
    console.log("startProcess")
    const allJobs = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'addresses.json')).toString())
    const addresses = Object.keys(allJobs)
    for (const address of addresses) {
        let amount = Number(allJobs[address]) * (10 ** 18)
        let receipt = await sendSingleTransaction(address, amount)
        console.log(receipt)
        if(receipt!="sendSingleTransactionFailed"){
            await saveReceipt(address, receipt)
        }
    }
}

startTransaction().then(() => {
    console.log("completeProcess")
})
