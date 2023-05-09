
const NodeRSA = require('node-rsa');

 const rsaKEY = () => {
     let isCreated = false
     let rsa;
     if (!isCreated) {
         const rsa = new NodeRSA({b: process.env.KEY});
         return rsa
     } else {
         isCreated = true
         return rsa
     }
 }


const MINE_RATE = 1000 // The mining rate of the blockchain (in milliseconds)
const INITIAL_DIFFICULTY = 3 // The initial difficulty of the blockchain

const GENESIS_DATA = { // The data for the genesis block
    timeStamp: 1000, // The timestamp of the genesis block
    lastHash: '---', // The hash of the previous block (genesis block has none)
    hash: 'hash-one', // The hash of the current block
    data: [], // The data of the genesis block (empty array)
    difficulty: INITIAL_DIFFICULTY, // The difficulty of the genesis block
    nonce: 0 // The nonce value of the genesis block
}

const STARTING_BALANCE = 1000 // The starting balance for each wallet in the blockchain

const REWARD_INPUT = { address: '*authorized-reward*' }

const MINING_REWARD = 50

module.exports = {
    GENESIS_DATA,
    MINE_RATE,
    STARTING_BALANCE,
    REWARD_INPUT,
    MINING_REWARD,
    rsaKEY
} // Export the constants for use in other modules
