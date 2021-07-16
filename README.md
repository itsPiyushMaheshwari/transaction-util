# Transaction-Util

Transaction-util is a utility for sending transactions to the Polygon network in a robust manner.

Following are some of the features:
- Waits for pending transactions for 12 blocks conformation and for 2 minutes, if it is not confirmed then it sends the transaction again with higher gas price.
- on completion of transaction it will save the status, failed or completed in result.json file
- It does not include bach transactions for now.

### How it works
1. The [addresses](./src/addresses.json) is the list of addresses to which MATIC needs to be sent
2. The [result](./src/result.json) is the status of each transaction, it is is confirmed then it will show the transaction hash and if it gets failed it shows "execution reverted.

