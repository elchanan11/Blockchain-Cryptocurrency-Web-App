const Transaction = require('./transaction')
const Wallet = require('./index')
const {verifySignature} = require("../util/index");
const { REWARD_INPUT, MINING_REWARD } = require('../config')

describe('Transaction', () => {
    let transaction, senderWallet, recipient, amount

    describe('and the amount is valid', () => {
        beforeEach(() => {
            senderWallet = new Wallet()
            recipient = 'recipient-public-key'
            amount = 50

            transaction = new Transaction({ senderWallet, recipient, amount })
        })

        // Test case for verifying that the transaction object has an 'id' property
        it('has an `id`', function () {
            expect(transaction).toHaveProperty('id')
        });

        // Test suite for verifying the behavior of the outputMap method
        describe('outputMap', () => {

            // Test case for verifying that the transaction object has an 'outputMap' property
            it('has an output map', function () {
                expect(transaction).toHaveProperty('outputMap')
            });

            // Test case for verifying that the outputMap method correctly outputs the amount to the recipient
            it('outputs the amount to the recipient', function () {
                expect(transaction.outputMap[recipient]).toEqual(amount)
            });

            // Test case for verifying that the outputMap method correctly outputs the remaining balance for the senderWallet
            it('outputs the remaining balance for the `sender wallet`', function () {
                expect(transaction.outputMap[senderWallet.publicKey])
                    .toEqual(senderWallet.balance - amount)
            });
        })

        describe('input', () => {
            it('should ', function () {
                expect(transaction).toHaveProperty('input')
            });

            it('has timestamp', function () {
                expect(transaction.input).toHaveProperty('timestamp')
            });

            it('sets the `amount` to the `senderWallet` balance', () => {
                expect(transaction.input.amount).toEqual(senderWallet.balance)
            })

            it('sets the `address` to the `senderWallet` publicKey', function () {
                expect(transaction.input.address).toEqual(senderWallet.publicKey)
            });

            it('signs the input', function () {
                expect(
                    verifySignature({
                        publicKey: senderWallet.publicKey,
                        data: transaction.outputMap,
                        signature: transaction.input.signature
                    })
                ).toBe(true)
            });
        })

        describe('validTransaction', () => {
            describe('when the transaction is valid', () => {
                it('returns true', function () {
                    expect(Transaction.validTransaction(transaction)).toBe(true)
                });
            })

            describe('when the transaction is invalid', () => {
                let errorMock

                beforeEach(() => {
                    errorMock = jest.fn()

                    global.console.error = errorMock
                })

                describe('and the transaction outputMap value is invalid', () => {
                    it('returns false and logs an error', function () {
                        transaction.outputMap[senderWallet.publicKey] = 999999

                        expect(Transaction.validTransaction(transaction)).toBe(false)
                        expect(errorMock).toBeCalled()
                    });
                })

                describe('and the transaction signature value is invalid', () => {
                    it('returns false and logs an error', function () {
                        transaction.input.signature = new Wallet().sign('data')

                        expect(Transaction.validTransaction(transaction)).toBe(false)
                        expect(errorMock).toBeCalled()
                    });
                })
            })
        })

        describe('update()', () => {
            let originalSignature, originalSenderOutput, nextRecipient, nextAmount;

            describe('and the amount is valid' ,() => {
                it('throws an error', function () {
                    expect(() => {
                        transaction.update({
                            senderWallet, recipient: 'foo', amount: 999999
                        })
                    }).toThrow('Amount exceeds balance')
                });
            })

            beforeEach(() =>{
                originalSignature = transaction.input.signature
                originalSenderOutput = transaction.outputMap[senderWallet.publicKey]
                nextRecipient = 'next-recipient'
                nextAmount = 50

                transaction.update({ senderWallet, recipient: nextRecipient, amount: nextAmount })
            })

            it('should outputs the amount to the next recipient', function () {
                expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount)
            });

            it('subtracts the amount from the original output amount', function () {
                expect(transaction.outputMap[senderWallet.publicKey])
                    .toEqual(originalSenderOutput - nextAmount)
            });

            it('maintains a total output that matches the input amount', function () {
                expect(
                    Object.values(transaction.outputMap)
                        .reduce((total, outputAmount) => total + outputAmount)
                ).toEqual(transaction.input.amount)

            });

            it('re-signs the transaction', function () {
                expect(transaction.input.signature)
                    .not.toEqual(originalSignature)
            });

            describe('and another update for the same recipient', () => {
                let addedAmount;

                beforeEach(() => {
                    addedAmount = 80
                    transaction.update({
                        senderWallet, recipient: nextRecipient, amount: addedAmount
                    })
                })

                it('adds to the recipients amount', function () {
                    expect(transaction.outputMap[nextRecipient])
                        .toEqual(nextAmount + addedAmount)
                });

                it('subtracts the amount from the original sender output amount', function () {
                    expect(transaction.outputMap[senderWallet.publicKey])
                        .toEqual(originalSenderOutput - nextAmount - addedAmount)
                });
            })
        })

        describe('rewardTransaction()' ,() => {
            let rewardTransaction, minerWallet;

            beforeEach(() => {
                minerWallet = new Wallet()
                rewardTransaction = Transaction.rewardTransaction({ minerWallet })
            })

            it('creates a transaction with the reward input', function () {
                expect(rewardTransaction.input)
                    .toEqual(REWARD_INPUT)
            });

            it('created ones transaction for the miner with the mining reward', function () {
                expect(rewardTransaction.outputMap[minerWallet.publicKey])
                    .toEqual(MINING_REWARD)
            });
        })
    })
})
