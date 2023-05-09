const PubNub = require('pubnub')

const credentials = {
    publishKey: "pub-c-c6f7704f-c96d-4411-b0e9-a3b24f2ec9b1",
    subscribeKey: "sub-c-e4d34e8e-cb4c-43ea-8ad4-cefa71cad336",
    userId: "sec-c-YWJhMWY3YzYtNjNmMC00ZDFiLTk3ZjMtOTFjM2VjMjZkMTU3"
}

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION : 'TRANSACTION'
}

class Pubsub {
    constructor({ blockchain, transactionPool, wallet }) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;

        this.pubnub = new PubNub(credentials);

        this.pubnub.subscribe({ channels: Object.values(CHANNELS) });

        this.pubnub.addListener(this.listener());
    }

    listener() {
        return {
            message: messageObject => {
                const {channel, message} = messageObject;

                // console.log(`Message received. Channel: ${channel}. Message: ${message}`);
                const parsedMessage = JSON.parse(message);

                switch (channel) {
                    case CHANNELS.BLOCKCHAIN:
                        this.blockchain.replaceChain(parsedMessage, true,() => {
                            this.transactionPool.clearBlockchainTransactions({
                                chain: parsedMessage
                            })
                        })
                        break;
                    case CHANNELS.TRANSACTION:
                        if (!this.transactionPool.existingTransaction({
                            inputAddress: this.wallet.publicKey
                        })) {
                            this.transactionPool.setTransaction(parsedMessage);
                        }
                        break;
                    default:
                        return;
                }
            }
        }
    }

    publish({ channel, message }) {
        // this.pubnub.unsubscribe(channel,() => {
            this.pubnub.publish({ channel, message }, () => {
                // this.pubnub.subscribe(channel)
            })
        // })
    }

    broadcastChain() {
        this.publish({
            channel: CHANNELS.BLOCKCHAIN,
            message: JSON.stringify(this.blockchain.chain)
        })
    }

    broadCastTransaction (transaction) {
        this.publish({
            channel: CHANNELS.TRANSACTION,
            message: JSON.stringify(transaction)
        })
    }
}

module.exports = Pubsub