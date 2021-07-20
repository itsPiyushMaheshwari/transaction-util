const path = require("path")
const dotenv = require("dotenv")

// load config env
let root = path.normalize(`${__dirname}/../..`)

const fileName = `/config.env`
const configFile = `${root}${fileName}`
dotenv.config({ path: configFile, silent: true })

module.exports = {
  fromAddress: process.env.FROM_ADDRESS,
  privateKey: process.env.PRIVATE_KEY,
  mainRPC: process.env.MAIN_RPC,
  maticRPC: process.env.MATIC_RPC,
  maticGasStation: process.env.MATIC_GAS_STATION
}
