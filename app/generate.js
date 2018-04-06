// https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/test/integration/bip32.js#L83
const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')
const fs = require('fs')

const language = 'english'
const wordlist = require(`./wordlists/${language}`)
const addressFolder = 'addresses'
const start = 0
for (let i = start; i < 2048; i++) {
  const wordA = wordlist[i]
  const fileName = `${addressFolder}/${language}-${i}-${wordA}`
  wordlist.forEach(wordB => {
    console.time('duration')
    console.log(`${wordA} ${wordB}`)
    wordlist.forEach(wordC => {
      const mnemonic = `${wordA} ${wordB} ${wordC}`
      const bip39seed = bip39.mnemonicToSeed(mnemonic)
      const root = bitcoin.HDNode.fromSeedBuffer(bip39seed)
      const address = root.derivePath("m/44'/0'/0'/0/0").getAddress()
      fs.appendFileSync(fileName, `${address}\n`)
    })
    console.timeEnd('duration')
  })
}
