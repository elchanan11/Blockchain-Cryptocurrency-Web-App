const Transaction = require('./transaction')
const BlockChain = require('../blockchain')

class TransactionPool {
    constructor() {
        this.transactionMap = {}
    }

    setTransaction(transaction) {
        this.transactionMap[transaction.id] = transaction
    }

    setMap(transactionMap) {
        this.transactionMap = transactionMap
    }

    existingTransaction({ inputAddress }) {
        const transactions = Object.values(this.transactionMap)

        return  transactions.find(transaction => transaction.input.address === inputAddress)
    }

    validTransactions() {
        return Object.values(this.transactionMap)
            .filter(
                transaction => Transaction.validTransaction(transaction)
            )
    }

    clear() {
        this.transactionMap = {}
    }

    clearBlockchainTransactions({ chain }) {

        for (let i = 1; i < chain.length; i++) {
            let block = chain[i]
            for (let transaction of block.data) {
                if (this.transactionMap[transaction.id]) {
                    delete this.transactionMap[transaction.id]
                }
            }
        }

    }
}

module.exports = TransactionPool