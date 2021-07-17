import Web3 from 'web3'

export default class Web3Client {
    constructor(provider, privateKey, options) {
        this.web3 = new Web3(provider)
        this.web3.eth.accounts.wallet.add(privateKey);
        this.options = options
    }

    transaction(address, amount, gasPrice, nonce) {
        return new Promise(async (resolve, reject) => {
            const accounts = await web3.eth.getAccounts()
            const formattedAddress = web3.utils.toChecksumAddress(address)
            this.web3.eth
            .sendTransaction({
                from: accounts[0],
                to: formattedAddress,
                value: amount,
                gas: 21000,
                gasPrice: gasPrice,
                nonce: nonce
            })
            .on('transactionHash', (transactionHash) => {
                resolve(transactionHash)
            })
            .catch(reject)
        })
    }

    async isConfirmed(txHash, blocks) {
        const tx = await this.web3.eth.getTransaction(txHash)
        // console.log('tx', tx)
        if (!tx || !tx.blockNumber) {
            console.log(`${txHash} is still pending`)
            return false
        }
        const block = await this.web3.eth.getBlock('latest')

        if (block.number - tx.blockNumber >= blocks) {
            return true
        } else {
            console.log(`current block is at ${block.number} while tx was in ${tx.blockNumber}`)
            return false
        }
    }
}
