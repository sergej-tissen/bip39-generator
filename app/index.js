// https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/test/integration/bip32.js#L83
const bip39 = require('bip39')
const bitcoin = require('bitcoinjs-lib')
const fs = require('fs')

const wordlistEnglish = require('./wordlists/english')
const addressFile = 'addresses.txt'
const wordA = wordlistEnglish[0]

wordlistEnglish.forEach(wordB => {
    console.log(wordB)
    wordlistEnglish.forEach(wordC => {
        const mnemonic = `${wordA} ${wordB} ${wordC}`
        const bip39seed = bip39.mnemonicToSeed(mnemonic)
        const root = bitcoin.HDNode.fromSeedBuffer(bip39seed)
        const address = root.derivePath("m/44'/0'/0'/0/0").getAddress()
        fs.appendFileSync(addressFile, `${address}\n`)
    })
})

