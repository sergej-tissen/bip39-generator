const { pipe, flatten } = require('ramda')
const util = require('util')
const fs = require('fs')
const exec = require('child_process').execSync

// () -> Number
const getBlockHeight = () => exec('bitcoin-cli getblockcount').toString()

// Number -> { String [String] }
const getTransactions = blockNumber => {
  const blockHash = exec(`bitcoin-cli getblockhash ${blockNumber}`).toString()
  const blockInfo = exec(`bitcoin-cli getblock ${blockHash}`).toString()
  const txids = JSON.parse(blockInfo).tx
  return { blockHash, txids }
}

// { String [String] } -> [String]
const getOutputAddresses = ({ blockHash, txids }) => {
  return flatten(
    flatten(
      txids.map(txid => JSON.parse(exec(`bitcoin-cli getrawtransaction ${txid} true ${blockHash}`).toString()))
      .map( tx => tx.vout))
      .map( vout => vout.scriptPubKey.addresses))
}

// [String] -> [String]
const checkTrackedAddresses = (addresses) => {
  return addresses.filter(address => {
    try {
      const count = exec(`fgrep -or ${address} addresses | wc -l`).toString()
      if (count > 0) {
        console.log('Match found: ', address)
        return true
      } else {
        return false
      }
    } catch (e) {
      console.log('FAIL', address)
      return false
    }
  })
}

// [String] -> 
const storeFoundAddresses = (addresses) => {
  addresses.forEach(address => fs.appendFileSync('activeTrackedAddresses', `${address}\n`))
}

const run = () => {
  const processedBlockNumber = Number(fs.readFileSync('processedBlockNumber', 'utf-8'))
  const nextBlockNumber = processedBlockNumber + 1
  const blockHeight = getBlockHeight()
  for (let i = nextBlockNumber; i <= blockHeight; i++) {
    console.log('Block: ', i)
    pipe(getTransactions, getOutputAddresses, checkTrackedAddresses, storeFoundAddresses)(i)
    fs.writeFileSync('processedBlockNumber', i);
  }
  setTimeout(run, 30000);
}

run()

