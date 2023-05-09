const bodyParser = require('body-parser')
const express = require('express')
const cors = require('cors')
const request = require('request')
const path = require('path')
const Blockchain = require('./blockchain')
const PubSub = require('./app/pubsub')
const TransactionPool = require('./wallet/transaction-pool')
const Wallet = require('./wallet')
const TransactionMiner = require('./app/transaction-miner')
require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const filePath = './fileSystem.txt';

// Set the default port for the app
const DEFAULT_PORT = 8080


// Set the root node address for syncing chains
const ROOT_NODE_ADDRESS  = `http://localhost:${DEFAULT_PORT}`

// Create a new instance of the express app
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server,{
    cors: {
        origin: "*"
    }
});

const blockchain = new Blockchain()
const transactionPool = new TransactionPool()
const wallet = new Wallet()
const pubSub = new PubSub({ blockchain ,transactionPool, wallet })
const transactionMiner = new TransactionMiner({
    blockchain, transactionPool, wallet, pubSub
})

app.use(cors());
// Set up middleware for parsing JSON data in requests
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'client')))

// Set up endpoint for getting the blockchain
app.get('/api/blocks', (req, res) => {

    const blockchainData = JSON.stringify(blockchain.chain);
    fs.writeFile(filePath, blockchainData, { flag: 'w' }, (err) => {
        if (err) throw err;
        console.log('Data has been written to the file!');
    });
    res.json(blockchain.chain)
})

app.get('/api/blocks/length',(req, res) => {

    res.status(200).json(blockchain.chain.length)
})

app.get('/api/blocks/:id', (req, res) => {
    const { id } = req.params
    const { length } = blockchain.chain

    const blocksReversed = blockchain.chain.slice().reverse()

    let startIndex = (id - 1) * 5
    let endIndex = id * 5

    startIndex = startIndex < length ? startIndex : length
    endIndex = endIndex < length ? endIndex : length

    res.status(200).json(blocksReversed.slice(startIndex, endIndex))
})

// Set up endpoint for adding a block to the blockchain
app.post('/api/mine', (req, res) => {
    const { data } = req.body

    blockchain.addBlock({ data })

    pubSub.broadcastChain()

    res.redirect('/api/blocks')
})

app.post('/api/transact', (req, res) => {
    const { amount, recipient } = req.body

    let transaction = transactionPool
        .existingTransaction({ inputAddress: wallet.publicKey })

    try {
        if (transaction) {
            transaction.update({ senderWallet: wallet, recipient, amount })
        } else {
            transaction = wallet.createTransaction({
                recipient,
                amount,
                chain: blockchain.chain
            });
        }
    }catch (e) {
        return res.status(400).json({ type: 'error', message: e.message})
    }

    transactionPool.setTransaction(transaction)

    pubSub.broadCastTransaction(transaction)

    res.status(200).json({ type: 'success', transaction })
})

app.get('/api/transaction-pool-map', (req, res) => {

    res.status(200).json(transactionPool.transactionMap)
})

app.get('/api/mine-transactions', (req, res) => {
    transactionMiner.mineTransaction()

    res.redirect('/api/blocks')
})

app.get('/api/wallet/info', (req, res) => {
    const address = wallet.publicKey

    res.json({
        address: address,
        balance: Wallet.calculateBalance({ chain: blockchain.chain, address: address })
    })
})

app.get('/api/known-addresses', (req, res) => {
    let addressMap = {}

    for (let block of blockchain.chain) {
        for (let transaction of block.data) {
            const recipient = Object.keys(transaction.outputMap)

            recipient. forEach(recipient => addressMap[recipient] = recipient)
        }
    }

    res.status(200).json(Object.keys(addressMap))
})

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './client/index.html'));
});

const syncWithRootState = () => {
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks` }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootChain = JSON.parse(body)

            console.log('replace chain with root sync', rootChain)
            blockchain.replaceChain(rootChain)
        }
    })
    request({ url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map` }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const rootTransactionPoolMap = JSON.parse(body);

            transactionPool.setMap(rootTransactionPoolMap);
        }
    });
}

let PEER_PORT;
if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000)
}

 const PORT = PEER_PORT || DEFAULT_PORT

process.env.PORT = PORT;

io.on('connection', (socket) => {

    socket.on('transaction-mined', (msg) => {
        console.log('transaction-mined from socket')
        io.emit('transaction-mined', 'transaction happend inform server')
    });
});

server.listen(PORT, () =>{
    console.log(`app is running in port ${PORT}`)

    if (PORT !== DEFAULT_PORT) {
        syncWithRootState()
    }
})

//
// const walletFoo = new Wallet()
// const walletBar = new Wallet()
//
// const generateWalletTransacttion = ({ wallet, recipient, amount }) => {
//     const transaction = wallet.createTransaction({
//         recipient, amount, chain: blockchain.chain
//     })
//
//     transactionPool.setTransaction(transaction)
//
// }
//
// const walletAction = () => generateWalletTransacttion({
//     wallet, recipient: walletFoo.publicKey, amount: 5
// })
//
// const walletFooAction = () => generateWalletTransacttion({
//     wallet: walletFoo, recipient: walletBar.publicKey, amount: 10
// })
//
// const walletBarAction = () => generateWalletTransacttion({
//     wallet: walletBar, recipient: walletFoo.publicKey, amount: 15
// })
//
// for (let i = 0; i < 30; i++) {
//     if (i%3===0) {
//         walletAction()
//         walletFooAction()
//     } else if (i%3===1){
//         walletAction()
//         walletBarAction()
//     } else {
//         walletFooAction()
//         walletBarAction()
//     }
//
//     transactionMiner.mineTransaction()
// }
