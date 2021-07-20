# Transaction-Util

Transaction-util is a utility for sending transactions to the Polygon network in a robust manner.

Following are some of the features:
- Waits for pending transactions for 12 blocks conformation and for 2 minutes, if it is not confirmed then it sends the transaction again with higher gas price.
- on completion of transaction it will save the status, failed or completed in result.json file
- It does not include bach transactions for now.

## This repo contains 2 methods of doing transactions

## 1. SIMPLE METHOD - getting stansaction from addresses.json and then sending it one by one.

### How it works
- The [addresses](./src/addresses.json) is the list of addresses to which MATIC needs to be sent
- The [result](./src/result.json) is the status of each transaction, it is is confirmed then it will show the transaction hash and if it gets failed it shows "execution reverted.
- you can use this method by running command ```node src index.js```
- Here, Gas price will be taken from [Polygon Gas Station]("https://docs.matic.network/docs/develop/tools/matic-gas-station/")
- If transaction is not confirmed withing 2 minutes then it will try to do the same transaction by increasing the gas price.

## 2. RabbitMq method

### to use this you must have RABBITMQ running somehwere


