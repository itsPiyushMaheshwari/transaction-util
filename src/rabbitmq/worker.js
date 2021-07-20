const Web3Client = require('./Web3Client')
const fs = require('fs')
const path = require('path')

export default class Worker {
    constructor(provider, queue, options, blockConfirmation, privateKey) {
        this.queue = queue;
        this.web3Client = new Web3Client(provider, privateKey, options);
        this.blockConfirmation = blockConfirmation
    }

    start(q) {
        this.queue.consume(q, async (msg) => {
            const job = JSON.parse(msg.content.toString())
            console.log("[x] Received %s", job.id);

            // check if this job is already in progress
            const status = this._getJobStatus(job.id)
            const receipt = null
            if (status == 'progress') {
                const allStatus = this._getStatus()
                const currentJob = allStatus[job.id]
                const txHash = currentJob.txHash
                receipt = this.waitForConfirmation(txHash)
                if (!receipt) {
                    receipt = await this.handleTransaction(job)
                }
                this._onJobCompletion(job, receipt)
                return this.queue.channel.ack(msg)
            } else if (status == 'complete') {
                return this.queue.channel.ack(msg)
            }

            receipt = await this.handleTransaction(job)

            // wait for tx confirmation before consuming new messages
            this._onJobCompletion(job, receipt)
            this.queue.channel.ack(msg)
        }, {})
    }

    _getJobStatus(jobId) {
        const status = this._getStatus()
        const job = status[jobId]
        return job ? job.status : 'process'
    }

    _getStatus() {
        let status = {}
        const statusFile = `status.json`
        if (fs.existsSync(statusFile)) {
            try {
                status = JSON.parse(fs.readFileSync(path.resolve(__dirname, resultFile)).toString())
            } catch (e) {
                console.log("error in getting status", e)
            }
        }
        return status
    }

    async handleTransaction(job) {
        console.log('job.userAddress', job.userAddress, 'amount', job.amount)
        const txHash = await this.web3Client.transaction(job)
        const status = this._getStatus()
        status[job.id] = { ...job, txHash, status: 'progress' }
        console.log(status)
        this._writeStatusToFile(status)

        let gasPrice = 0
        let receipt = null;
        while (!receipt) {
            gasPrice += 20000000000
            const nonce = await this.web3Client.getNonce()
            const txHash = await this.web3Client.transaction(job.userAddress, job.amount, gasPrice, nonce)
            console.log(txHash, gasPrice, nonce)
            receipt = await this.waitForConfirmation(txHash)
        }
        return receipt
    }

    async waitForConfirmation(txHash) {
        let i = 0
        while (i < 8) {
            if (await this.web3Client.isConfirmed(txHash, this.blockConfirmation)) {
                console.log(txHash, 'confirmed')
                const receipt = await web3.eth.getTransactionReceipt(txHash)
                if (receipt != null) return receipt
            }
            i += 1
            await Worker.delay(10)
        }
        return null
    }

    static delay(s) {
        console.log('sleeping for', s, 'secs...')
        return new Promise(resolve => setTimeout(resolve, s * 1000));
    }

    _onJobCompletion(job, receipt) {
        console.log(`job ${job.id} completed`)
        const status = this._getStatus()
        status[job.id].transactionHash = receipt.transactionHash
        if (receipt.status == false) {
            status[job.id].status = 'reverted'
            this._writeStatusToFile(status)
            throw new Error(`reverted: ${JSON.stringify(receipt, null, 2)}`)
        }
        status[job.id].status = 'complete'
        this._writeStatusToFile(status)
    }

    _writeStatusToFile(status) {
        const statusFile = `status.json`
        fs.writeFileSync(path.resolve(__dirname, resultFile), JSON.stringify(status, null, 2)) // Indent 2 spaces
    }
}
