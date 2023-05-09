const Blockchain = require('./index')
const Block = require('./block')
const {cryptoHash} = require('../util')
const Wallet = require("../wallet");
const Transaction = require("../wallet/transaction");

describe('Blockchain', () =>{
    let blockChain, newChain, originalChane,errorMock;

    beforeEach(() => {
        blockChain = new Blockchain()
        newChain = new Blockchain()
        errorMock = jest.fn()

        originalChane = blockChain.chain
        global.console.error = errorMock
    })

    it('contains a `chain` Array instance ', function () {
        expect(blockChain.chain instanceof Array).toBe(true)
    });

    it('starts with the genesis block', function () {
        expect(blockChain.chain[0] ).toEqual(Block.genesis())
    });

    it('adds anew block to the chain ', function () {
        const newData = 'foo bar'
        blockChain.addBlock({ data: newData })

        expect(blockChain.chain[blockChain.chain.length - 1].data).toEqual(newData)
    });

    describe('isValidChain', () => {
        describe('when the chain deas not starts with the genesis block', () =>{
            it('returns false', function () {
                blockChain.chain[0] = { data: 'fake genesis' }

                expect(Blockchain.isValidChain(blockChain.chain)).toBe(false)
            });
        })
        describe('when the chain starts with the genessis block and has multiple blocks', () =>{
            beforeEach(() => {
                blockChain.addBlock({ data: 'bears' })
                blockChain.addBlock({ data: 'beers ss' })
                blockChain.addBlock({ data: 'Galactic' })
            })
            describe('and a last hash reference has changed',() => {
                it('returns false', function () {
                    blockChain.chain[2].lastHash = 'broken-last-hasg'

                    expect(Blockchain.isValidChain(blockChain.chain)).toBe(false)
                });
            })

            describe('and the chain contains a block with invalid field',() => {
                it('returns false', function () {
                    blockChain.chain[2].data = 'evil data'

                    expect(Blockchain.isValidChain(blockChain.chain)).toBe(false)
                });
            })

            describe('and the chain deas not contain any invalid blocks', () => {
                it('returns true', function () {
                    expect(Blockchain.isValidChain(blockChain.chain)).toBe(true)
                });
            })

            describe('and the chain contains a block with a jumped difficulty', ()=>{
                it('returns false', function () {
                    const lastBlock = blockChain.chain[blockChain.chain.length -1]

                    const lastHash = lastBlock.hash
                    const timeStamp = Date.now()
                    const nonce = 0
                    const data = []
                    const difficulty = lastBlock.difficulty - 3
                    const hash = cryptoHash(timeStamp, lastHash, difficulty, nonce, data)
                    const basBlock = new Block({
                        timeStamp, lastHash, hash, nonce, difficulty, data
                    })
                    blockChain.chain.push(basBlock)

                    expect(Blockchain.isValidChain(blockChain.chain))
                        .toBe(false)
                });
            })
        })
    })

    describe('replaceChain()', () => {
        let logMock;

        beforeEach(() => {
            logMock = jest.fn()

            global.console.log = logMock
        })

        describe('when the new chain not longer', () => {
            beforeEach(() => {
                newChain.chain[0] = { new: 'chain' }

                blockChain.replaceChain(newChain.chain)
            })
            it('deas not replace the chane', function () {
                  expect(blockChain.chain).toEqual(originalChane)
            });

            it('logs an error', function () {
                expect(errorMock).toHaveBeenCalled()
            });
        })

        describe('when the new chain is longer', () => {
            beforeEach(() => {
                newChain.addBlock({ data: 'bears' })
                newChain.addBlock({ data: 'beers ss' })
                newChain.addBlock({ data: 'Galactic' })
            })

            describe('and the chain is inValid', () => {
                beforeEach(() => {
                    newChain.chain[2].hash = 'some fake hash'

                    blockChain.replaceChain(newChain.chain)
                })

                it('deas not replace the chain', function () {
                    expect(blockChain.chain).toEqual(originalChane)
                });

                it('logs an error', function () {
                    expect(errorMock).toHaveBeenCalled()
                });
            })

            describe('and the chane is valid', () => {
                beforeEach(() => {
                    blockChain.replaceChain(newChain.chain)
                })

                it('replaces the chane', () => {
                    expect(blockChain.chain).toEqual(newChain.chain)
                })

                it('logs chain replacement', function () {
                    expect(logMock).toHaveBeenCalled()
                });
            })
        })
    })

    describe('validTransactionData()' ,() => {
        let transaction, rewardTransaction, wallet;

        beforeEach(() => {
            wallet = new Wallet()
            transaction = wallet.createTransaction({ recipient: 'foo-adress', amount: 65 })
            rewardTransaction = Transaction.rewardTransaction({ minerWallet: wallet })
        })

        describe('transaction data is valid', () => {
            it('returns true', function () {
                newChain.addBlock({data: [transaction, rewardTransaction]})

                expect(blockChain.validTransactionsData({ chain: newChain.chain }))
                    .toBe(true)
            });
        })

        describe('and the transaction data has multipule rewards', () => {
            it('return false and logs an error', function () {
                newChain.addBlock({ data: [transaction, rewardTransaction, rewardTransaction] })

                expect(blockChain.validTransactionsData({ chain: newChain.chain }))
                    .toBe(false)
                expect(errorMock).toHaveBeenCalled()
            });
        })

        describe('and the transaction data has at least malformed outMap', () => {
            describe('and the transaction is not a reward transaction', () => {
                it('returns false and logs an error', function () {
                    transaction.outputMap[wallet.publicKey] = 999999

                    newChain.addBlock({ data: [transaction, rewardTransaction] })

                    expect(blockChain.validTransactionsData({ chain: newChain.chain }))
                        .toBe(false)
                    expect(errorMock).toHaveBeenCalled()
                });
            })

            describe('and the transaction is  a reward transaction', () => {
                it('returns false and logs an error', function () {
                    rewardTransaction.outputMap[wallet.publicKey] = 99999

                    newChain.addBlock({ data: [transaction, rewardTransaction] })

                    expect(blockChain.validTransactionsData({ chain: newChain.chain }))
                        .toBe(false)
                    expect(errorMock).toHaveBeenCalled()
                });
            })

            describe('and the transaction data has at least one malformed input', () => {
                it('returns false and logs an error', () => {
                    wallet.balance = 9000;

                    const evilOutputMap = {
                        [wallet.publicKey]: 8900,
                        fooRecipient: 100
                    };

                    const evilTransaction = {
                        input: {
                            timestamp: Date.now(),
                            amount: wallet.balance,
                            address: wallet.publicKey,
                            signature: wallet.sign(evilOutputMap)
                        },
                        outputMap: evilOutputMap
                    };

                    newChain.addBlock({ data: [evilTransaction, rewardTransaction] });
                    expect(blockChain.validTransactionsData({ chain: newChain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            })

            describe('and the block contains multiple identical transactions', () => {
                it('returns false and logs an error', function () {
                    newChain.addBlock({
                        data: [transaction, transaction, transaction, rewardTransaction]
                    })

                    expect(blockChain.validTransactionsData({ chain: newChain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            })
        })
    })

})