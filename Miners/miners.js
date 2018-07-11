
const Transaction = require('../Wallets/transaction');
const Wallet = require('../Wallets/Wallet');
class Miner {
    constructor(blockchain, transactionPool, wallet, p2pServer) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.p2pServer = p2pServer;
    }

    mine() {
        const validTransactions = this.transactionPool.validTransactions();
        console.log('----------------------');
        console.log(validTransactions);
        console.log('----------------------');

        if (this.transactionPool.validTransactions().length == 0){
            return
        }

        validTransactions.push(
            Transaction.rewardTransaction(this.wallet , Wallet.blockChainWallet())
        ) ;

        const block = this.blockchain.addBlock(validTransactions);
        this.p2pServer.syncChains();
        this.transactionPool.clearTransactions();

        // include a reward transaction for the miner
        // create a block consisting of the valid transactions
        // synchronize chains in the peer-to-peer server
        // clear the transaction pool
        // broadcast to every miner to clear their transaction pools
        this.p2pServer.broadcastClearTransaction()
        return block ;
    }
}

module.exports = Miner;