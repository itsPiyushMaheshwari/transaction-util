// import amqp from 'amqplib/callback_api'
const amqp = require('amqplib')

const QClient = class {
    constructor() {}
    
    async initialize() {
      this.conn = await amqp.connect('amqp://localhost:5672');
      return this.createChannel()
    }

    // we can create as many channels that we can in a single connection
    async createChannel() {
        this.channel = await this.conn.createChannel();
        return this.channel.prefetch(1)
    }

    // it will send the job (msg) to the Queue named queue
    async sendToQueue(queue, msg) {
        await this.channel.assertQueue(queue, {
            durable: false
        });

        return this.channel.sendToQueue(queue, Buffer.from(msg));
    }

    // it will sun queue jobs one by one of q
    async consume(q, callback, options) {
        await this.channel.assertQueue(q, { durable: false });
        return this.channel.consume(q, callback, options)
    }
};

export default getQueue = async() => {
    const q = new QClient()
    await q.initialize()
    return q
}
