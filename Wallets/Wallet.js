
const { INITIAL_BALANCE } = require('../BlockChain/config');
const ChainUtil = require('./chain-util');
const Transaction = require('./transaction');


class Wallet {
    constructor() {
        this.balance = INITIAL_BALANCE;
        this.keyPair = ChainUtil.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    toString() {
        return `Wallet -
    publicKey : ${this.publicKey.toString()}
    balance   : ${this.balance}`
    }

    sign(dataHash) {
        return this.keyPair.sign(dataHash);
    }


    createTransaction(recipient, amount, blockChain , transactionPool) {
       this.calculateBalance(blockChain)
        if (amount > this.balance) {
            console.log(`Amount: ${amount}, exceeds current balance: ${this.balance}`);
            return;
        }
        let transaction = transactionPool.existingTransaction(this.publicKey);
        if (transaction) {
            transaction.updateT(this, recipient, amount);
        } else {
            transaction = Transaction.newTransaction(this, recipient, amount);
            transactionPool.updateOrAddTransaction(transaction);
        }

        return transaction;
    }

    static blockChainWallet (){

        const blockChianWallet = new this();
        blockChianWallet.address = 'blockchainWallet-address';
        return blockChianWallet;

    }


    calculateBalance(blockChain){

        let balance = this.balance ;
        let transactions = [] ;


        blockChain.chain.forEach(block => block.data.forEach(transaction => {
            transactions.push(transaction);
        }))

        const walletInputs = transactions
            .filter(transaction => transaction.input.address === this.publicKey);

        let startTime = 0 ;


        if (walletInputs.length > 0 ){
            const recentInputT = walletInputs.reduce((prev,current) => prev.input.timestamp > current.input.timestamp ? prev : current);
            balance = recentInputT.outputs.find(output => output.address === this.publicKey).amount ;
            startTime = recentInputT.input.timestamp ;
        }
        transactions.forEach(transaction => {

            if(transaction.input.timestamp > startTime){
                transaction.outputs.find( output => {
                    if (output.address == this.publicKey){
                        balance += output.amount ;
                    }
                })
            }

        })

        return balance

    }

}

module.exports = Wallet;