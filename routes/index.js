var express = require('express');
var router = express.Router();
var BlockChain = require('../BlockChain/blockChain');

var Wallet = require('../Wallets/Wallet');
var TransactionPool = require('../Wallets/transaction-pool');

const wallet = new Wallet();
const tp = new TransactionPool();

const Miner = require('../Miners/miners');
const UTILs = require('../Wallets/Chain-Util');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

const P2pServer = require('../Socket/p2p-server');


const bc = new BlockChain();
const p2pServer = new P2pServer(bc, tp);


const miner = new Miner(bc , tp , wallet , p2pServer) ;

router.get('/blocks', function(req, res, next) {
    res.json({'Chains' : bc.chain , 'pool' : tp.transactions , 'Balance' : wallet.calculateBalance(bc)});
});

router.get('/transactions' , (req,res) =>{
    res.json(tp.transactions);
});

router.post('/transact' , (req,res) =>{

    const { recipient } = req.body;
    const transaction = wallet.createTransaction(recipient, 200 , bc , tp);
    p2pServer.broadcastTransaction(transaction);
    res.redirect('/transactions');

});

router.get('/public-key', (req, res) => {
    UTILs.genKeyPair();
    res.json({ publicKey: wallet.publicKey , keyPair : wallet.keyPair });
});

router.post('/mine', (req, res) => {

    if (!req.body.data){
        res.redirect('/blocks');
        p2pServer.syncChains();
        return
    }

     bc.addBlock(req.body.data);
    res.redirect('/blocks');
    p2pServer.syncChains();
});

router.post('/mine-transaction' , (req,res) => {
     miner.mine() ;
    res.redirect('/blocks');

}) ;





p2pServer.listen();

module.exports = router;
