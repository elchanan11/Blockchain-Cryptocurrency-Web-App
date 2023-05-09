const Block = require('./block')
const {cryptoHash} = require('../util')
const {REWARD_INPUT, MINING_REWARD} = require('../config')
const Transaction = require("../wallet/transaction");
const Wallet = require("../wallet");
const e = require("express");
const fs = require('fs');
const filePath = './fileSystem.txt';

class Index {
    constructor() {
        // Create a new chain with the genesis block
        this.chain = [Block.genesis()]
        this.getBlockFromFileSystem()
    }

    getBlockFromFileSystem() {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            try {
                const str = data
                if (str && str.length > 1) {
                    const chain = JSON.parse(str)
                    this.chain = chain
                }
            } catch (err) {
                console.error('Error parsing JSON data:', err);
            }
        });
    }


    addBlock({ data }) {
        // Mine a new block and add it to the chain
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length - 1],
            data: data
        })

        this.chain.push(newBlock)

    }

    static isValidChain(chain) {
        // Check if the genesis block of the chain is valid
        if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
            return false
        }

        // Check each block in the chain for validity
        for (let i = 1; i < chain.length; i++) {
            const { timeStamp, difficulty, nonce, lastHash, hash, data } = chain[i]
            const actualLastHash = chain[i - 1].hash
            const lastDifficulty = chain[i -1].difficulty

            // Check if the last hash in the current block matches the actual last hash in the previous block
            if (lastHash !== actualLastHash) return false

            // Validate the hash of the current block
            const validatedHash = cryptoHash(timeStamp, lastHash, data, difficulty, nonce)

            if (hash !== validatedHash) return false

            // Check the difference in difficulty between the current and previous blocks
            if (Math.abs(lastDifficulty - difficulty) > 1) return false
        }

        return true
    }

    replaceChain(chain, validateTransactions, onSuccess) {
        // Check if the incoming chain is longer than the current chain
        if (chain.length.length <= this.chain.length) {
            console.error('the incoming chain must be longer')
            return
        }

        // Check if the incoming chain is valid
        if (!Index.isValidChain(chain)) {
            console.error('the incoming chain must be valid')
            return;
        }

        if (validateTransactions && !this.validTransactionsData({ chain })) {
            console.error('Incoming chain has invalid data ')

            return;
        }

        if (onSuccess) onSuccess()

        // Replace the current chain with the incoming chain
        console.log('replacing chain with ', chain)
        this.chain = chain
    }

    validTransactionsData({ chain }) {

        for (let i = 1; i < chain.length ; i++) {
            let block = chain[i]
            let transactionRewardCount = 0
            const transactionSet = new Set()

            for (let transaction of block.data) {
                if (transaction.input.address === REWARD_INPUT.address) {
                    transactionRewardCount ++

                    if (transactionRewardCount > 1) {

                        console.error('Miner reward exceeds limit')
                        return false
                    }

                    if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) {
                        console.error('Miner reward amount is invalid')
                        return false
                    }
                } else {
                    if (!Transaction.validTransaction(transaction)) {
                        console.error('Miner reward amount is invalid')
                        return false
                    }

                    const trueBalance = Wallet.calculateBalance({
                        chain: this.chain,
                        address: transaction.input.address
                    })

                    if (trueBalance !== transaction.input.amount) {
                        console.error("s")
                        return false
                    }

                    if (transactionSet.has(transaction)) {
                        console.error('An identical transaction')
                        return false
                    } else {
                        transactionSet.add(transaction)
                    }
                }
            }
        }
        return true
    }
}

module.exports = Index
