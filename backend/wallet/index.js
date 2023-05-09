// Import STARTING_BALANCE from the config module
const { STARTING_BALANCE } = require('../config')
const Transaction = require ('./transaction')

// Import the EC and cryptoHash functions from the util module
const { ec, cryptoHash } = require('../util')

// Define the Wallet class
class Wallet {
    constructor() {
        // Set the balance of the wallet to the STARTING_BALANCE value
        this.balance = STARTING_BALANCE

        // Generate a new key pair using the elliptic curve algorithm
        this.keyPair = ec.genKeyPair()

        // Get the public key from the key pair and encode it as a hex string
        this.publicKey = this.keyPair.getPublic().encode('hex')
    }

    // Define the sign method that takes in data and returns a signature
    sign (data) {
        // Hash the data using the cryptoHash function
        const hash = cryptoHash(data)

        // Use the key pair to sign the hash and return the signature
        return this.keyPair.sign(hash)
    }

     createTransaction ({ recipient, amount, chain}) {

        if (chain) {
            this.balance = Wallet.calculateBalance({
                chain: chain,
                address: this.publicKey
            })
        }

        if (amount > this.balance) {
            throw new Error("Amount exceeds balance")
        }

        return new Transaction({senderWallet: this,recipient: recipient,amount:  amount})
    }

    static calculateBalance({chain, address}) {
        let hasConductedTransaction = false
        let outputTotal = 0

        for (let i = chain.length - 1; i > 0; i--) {
            let block = chain[i]

            for (let transaction of block.data) {

                if (transaction.input.address === address) {
                    hasConductedTransaction = true
                    console.log(transaction.input.amount)
                }

                const addressOutput = transaction.outputMap[address]

                if (addressOutput) {
                    outputTotal += addressOutput
                }
            }

            if (hasConductedTransaction) break
        }

        return hasConductedTransaction ?
            outputTotal :
            STARTING_BALANCE + outputTotal
    }
}

// Export the Wallet class
module.exports = Wallet
