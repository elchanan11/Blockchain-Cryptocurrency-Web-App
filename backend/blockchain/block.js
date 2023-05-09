const hexTOBinary = require('hex-to-binary')
const {GENESIS_DATA, MINE_RATE} = require("../config");
const {cryptoHash} = require("../util");

class Block {
    constructor({timeStamp, lastHash, hash, data, nonce, difficulty}) {
        this.timeStamp = timeStamp
        this.lastHash = lastHash
        this.hash = hash
        this.data = data
        this.nonce = nonce
        this.difficulty = difficulty
    }

    // Method to create the genesis block, which is the first block in the blockchain
    static genesis() {
        return new this(GENESIS_DATA)
    }

    // Method to mine a new block
    static mineBlock({ lastBlock, data }) {

        let hash, timeStamp

        const lastHash = lastBlock.hash
        let {difficulty} = lastBlock
        let nonce = 0

        // Loop through nonce values until a valid hash is found
        do{
            nonce ++
            timeStamp = Date.now()
            difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timeStamp: timeStamp })
            hash = cryptoHash(timeStamp, lastHash, data, difficulty, nonce)
        }while (hexTOBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty))

        // Return a new block with the correct values
        return new this({timeStamp, lastHash, data, nonce, difficulty, hash})
    }

    // Method to adjust the difficulty of mining a block based on how long it took to mine the previous block
    static adjustDifficulty ({ originalBlock, timeStamp }) {
        const { difficulty } = originalBlock

        if (difficulty < 1) return 1

        if (timeStamp - originalBlock.timeStamp > MINE_RATE) return difficulty - 1

        return difficulty + 1
    }
}

// Export the Blocks class
module.exports = Block
