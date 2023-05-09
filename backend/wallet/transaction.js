// Import required modules
const { v4: uuidv4 } = require('uuid');
const { verifySignature } = require('../util')
const { REWARD_INPUT, MINING_REWARD } = require('../config')

// Create Transaction class
class Transaction {
    constructor({senderWallet, recipient, amount, outputMap, input}) {
        // Generate unique id for transaction
        this.id = uuidv4();
        // Create output map for transaction
        this.outputMap = outputMap ||  this.createOutputMap({senderWallet, recipient, amount})
        // Create input for transaction
        this.input = input || this.createInput({senderWallet, outputMap: this.outputMap })
    }

    // Create output map for transaction
    createOutputMap({senderWallet, recipient, amount}) {
        const outputMap = {}

        // Assign amount to recipient in the output map
        outputMap[recipient] = amount
        // Calculate remaining balance for sender's wallet and assign it to the sender in the output map
        outputMap[senderWallet.publicKey] = senderWallet.balance - amount

        return outputMap
    }

    // Create input for transaction
    createInput({senderWallet, outputMap}) {
        const input = {}

        // Set timestamp for input
        input['timestamp'] = Date.now()
        // Set amount for input
        input['amount'] = senderWallet.balance
        // Set address(public key) for input
        input['address'] = senderWallet.publicKey
        // Sign the output map with the sender's wallet private key and set the signature for input
        input['signature'] = senderWallet.sign(outputMap)
        return input
    }

    // Validate a given transaction
    static validTransaction(transaction) {
        const { input: { address, amount, signature }, outputMap } = transaction

        // Calculate the sum of all output amounts in the output map
        const outputTotal = Object.values(outputMap)
            .reduce((total, outputAmount) => total + outputAmount)

        // If the input amount does not match the total output amount, the transaction is invalid
        if (amount !== outputTotal) {
            console.error(`Invalid transaction from ${address}`)
            return false
        }

        // If the signature for the output map is invalid, the transaction is invalid
        if (!verifySignature({ publicKey: address, data: outputMap, signature: signature })) {
            console.error(`Invalid signature from ${address}`)
            return false
        }

        // Transaction is valid if it passes both the above checks
        return true
    }

    update ({ senderWallet, recipient: recipient, amount: amount }) {

        if (amount > this.outputMap[senderWallet.publicKey]) {
            throw new Error('Amount exceeds balance')
        }

        if (!this.outputMap[recipient]) {
            this.outputMap[recipient] =  amount
        } else {
            this.outputMap[recipient] = this.outputMap[recipient] + amount
        }

        this.outputMap[senderWallet.publicKey] =
            this.outputMap[senderWallet.publicKey] - amount

        this.input = this.createInput({ senderWallet, outputMap: this.outputMap })
    }

    static rewardTransaction({ minerWallet }) {
        return new this({
            input: REWARD_INPUT,
            outputMap: { [minerWallet.publicKey]: MINING_REWARD }
        })
    }
}

// Export Transaction class
module.exports = Transaction
