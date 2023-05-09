const TransactionPool = require('./transaction-pool')
const Transaction = require('./transaction')
const Wallet = require('./index')
const BlockChain = require('../blockchain')

describe('TransactionPool', () => {
    let transactionPool, transaction,senderWallet

    beforeEach(() => {
        transactionPool = new TransactionPool()
        senderWallet = new Wallet()
        transaction = new Transaction({
            senderWallet: new Wallet(),
            recipient: 'fake-transaction',
            amount: 50
        })
    })
    describe('setTransaction()', () => {
        it('adds a transaction', function () {
            transactionPool.setTransaction(transaction)

            expect(transactionPool.transactionMap[transaction.id])
                .toBe(transaction)
        });

    })

    describe('validTransaction()' ,() => {
        let validTransaction, errorMock;

        beforeEach(() =>{
            validTransaction = []
            errorMock = jest.fn()
            global.console.error = errorMock

            for (let i = 0; i < 10; i++) {
                transaction = new Transaction({
                    senderWallet: senderWallet,
                    recipient: 'any-recipient',
                    amount: 30
                })
                if (i % 3 === 0) {
                    transaction.input.amount = 999999
                } else if (i % 3 === 1) {
                    transaction.input.signature = new Wallet().sign('foo')
                } else {
                    validTransaction.push(transaction)
                }

                transactionPool.setTransaction(transaction)
            }
        })

        it('returns valid Transactions', function () {
            expect(transactionPool.validTransactions()).toEqual(validTransaction)
        });

        it('logs error for invalid transactions', function () {
            expect(transactionPool.validTransactions())
            expect(errorMock).toHaveBeenCalled()
        });
    })

    describe('clear()', () => {
        it('clears the transactions ', function () {
            transactionPool.clear()

            expect(transactionPool.transactionMap)
                .toEqual({})
        });
    })

    describe('clear blockchain transactions', () => {
        it('clears the pool of any existing blockchain transactions', function () {
            const blockchain = new BlockChain()
            const expectedTransactionMap = {}

            for (let i = 0; i < 6; i++) {
                const transaction = new Wallet().createTransaction({
                    recipient: 'foo', amount: 20
                })

                transactionPool.setTransaction(transaction)

                if (i%2 === 0) {
                    blockchain.addBlock({ data: [transaction] })
                } else {
                    expectedTransactionMap[transaction.id] = transaction
                }
            }

            transactionPool.clearBlockchainTransactions({ chain: blockchain.chain })
            expect(transactionPool.transactionMap)
                .toEqual(expectedTransactionMap)
        });
    })
})