const Wallet = require('./index')
const Transaction = require('./transaction')
const { verifySignature } = require('../util/index')
const { STARTING_BALANCE } = require('../config')
const Blockchain = require('../blockchain')

describe('Wallet', () => {
    let wallet
    beforeEach(() => {
        wallet = new Wallet
    })

    it('has balance', function () {
        expect(wallet).toHaveProperty('balance')
    });

    it('has a `publicKey`', function () {
        expect(wallet).toHaveProperty('publicKey')
    });

    describe('signing data', () => {
        const data = 'foobar'

        it('verifies a signature', function () {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: wallet.sign(data)
                })
            ).toBe(true)
        });

        it('does not verify an invalid signature', function () {
            const newWallet = new Wallet()
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: newWallet.sign(data)
                })
            ).toBe(false)
        });
    })

    describe('create transaction()', () => {
        describe('and the amount exceeds the balance', () => {
            it('throws an error', function () {
                expect(() => wallet.createTransaction({ amount: 999999, recipient: 'foo-recipient' }))
                    .toThrow('Amount exceeds balance')
            });
        })

        describe('and the amount is valid', () => {
            let transaction, amount, recipient

            beforeEach(() => {
                amount = 50
                recipient = 'foo-recipient'
                transaction = wallet.createTransaction({ amount, recipient })
            })

            it('creates an instance if `Transaction`', function () {
                expect(transaction instanceof Transaction).toBe(true)
            });

            it('matches the transaction input with the wallet', function () {
                expect(transaction.input.address).toEqual(wallet.publicKey)
            });

            it('outputs the amount to the recipient', function () {
                expect(transaction.outputMap[recipient]).toEqual(amount)
            });
        })

        describe('and a chain is passed', () => {
            it('calls `Wallet.calculateBalance`', () => {
                const calculateBalanceMock = jest.fn();

                const originalCalculateBalance = Wallet.calculateBalance;

                Wallet.calculateBalance = calculateBalanceMock;

                wallet.createTransaction({
                    recipient: 'foo',
                    amount: 10,
                    chain: new Blockchain().chain
                });

                expect(calculateBalanceMock).toHaveBeenCalled();

                Wallet.calculateBalance = originalCalculateBalance;
            });
        });
    })

    describe('caculatedBalance()', () =>{
        let blockChain

        beforeEach(()=> {
            blockChain = new Blockchain()
        })

        describe('and there is no outputs for the wallet', () => {
            it('return the `STARTING_BALANCE`', function () {
                expect(
                    Wallet.calculateBalance(
                        {
                            chain: blockChain.chain,
                            address: wallet.publicKey
                        }
                    )
                ).toEqual(STARTING_BALANCE)
            });
        })
        describe('and there are outputs for the wallet',() => {
            let transactionOne, transactionTwo;

            beforeEach(() => {
                transactionOne = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 50
                })

                transactionTwo = new Wallet().createTransaction({
                    recipient: wallet.publicKey,
                    amount: 50
                })

                blockChain.addBlock({ data: [transactionOne, transactionTwo] })
            })

            it('adds the sum of all outputs to the wallet balance', function () {
                expect(
                    Wallet.calculateBalance(
                        {
                            chain: blockChain.chain,
                            address: wallet.publicKey
                        }
                    )
                ).toEqual(
                    STARTING_BALANCE +
                    transactionOne.outputMap[wallet.publicKey] +
                    transactionTwo.outputMap[wallet.publicKey]
                )
            });

            describe('and the wallet has made a transaction', () => {
                let recentTransaction;

                beforeEach(() => {
                    recentTransaction = wallet.createTransaction({
                        recipient: 'foo-address',
                        amount: 30
                    })

                    blockChain.addBlock({ data: [recentTransaction] })
                })

                it('returns the output amount recent traansaction', function () {
                    expect(
                        Wallet.calculateBalance({
                            chain: blockChain.chain,
                            address: wallet.publicKey
                        })
                    ).toEqual(recentTransaction.outputMap[wallet.publicKey] )
                });

                describe('and there are outputs next to and after the recent transaction', () => {
                    let sameBlockTransaction, nextBlockTransaction

                    beforeEach(() => {
                        recentTransaction = wallet.createTransaction({
                            recipient: 'later-foo',
                            amount: 60
                        })

                        sameBlockTransaction = Transaction.rewardTransaction({ minerWallet: wallet})

                        blockChain.addBlock({ data: [recentTransaction, sameBlockTransaction] })

                        nextBlockTransaction = new Wallet().createTransaction({
                            recipient: wallet.publicKey,
                            amount: 75
                        })

                        blockChain.addBlock({ data: [nextBlockTransaction] })
                    })
                    it('includes the output amount in the returned balance', function () {
                        expect(
                            Wallet.calculateBalance({
                                chain: blockChain.chain,
                                address: wallet.publicKey
                            })
                        ).toEqual(
                            recentTransaction.outputMap[wallet.publicKey] +
                            sameBlockTransaction.outputMap[wallet.publicKey] +
                            nextBlockTransaction.outputMap[wallet.publicKey]
                        )

                    });
                })
            })
        })
    })
})