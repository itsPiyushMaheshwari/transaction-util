const { getQueue, Sender, Worker } = require("./index")
const Web3 = require('web3')
const fs = require('fs')
const path = require('path')
const config = require("./config/index")
const provider = new Web3.providers.HttpProvider(config.maticRPC);

const addToQueue = async (sender) => {
    try {
        const allJobs = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../addresses.json')).toString())
        const addresses = Object.keys(allJobs)
        for (const address of addresses) {
            let amount = Number(allJobs[address]) * (10 ** 18)
            const msg = JSON.stringify({
                id: address.toLowerCase(),
                userAddress: address.toLowerCase(),
                amount: amount,
            })
            sender.send(msg, "send-transactions")
        }
        return true
    } catch (e) {
        console.log("error in adding jobs to queue", e)
        return false
    }

}

const exampleScript = async () => {
    try {
        // connect to rabitMq and get a connection channel
        const queue = getQueue()

        // create sender object with queue as parameter
        const sender = new Sender(queue)

        // Add all jobs from addresses.json to the queue
        await addToQueue(sender)

        // create worker object with parameter
        const worker = new Worker(provider, queue, {}, 12, config.privateKey)

        // start consuming the queue
        worker.start("send-transactions")

    } catch (e) {
        console.log("error in exampleScript", e)
        return false
    }
}

exampleScript().then((data) => {
    console.log("done")
})