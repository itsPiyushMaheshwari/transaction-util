// const msg = JSON.stringify({
//     id: "userAddress",
//     userAddress: "userAddress",
//     amount: "amount",
// })

export default class Sender {
    constructor(queue) {
      this.queue = queue
    }
  
    // structure of msg is created above
    async send(msg, q = 'default-q') {
      await this.queue.sendToQueue(q, msg)
      console.log("[x] Queued", JSON.parse(msg).id);
    }
}


