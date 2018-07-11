const {MINE_RATE , DIFFICULTY} = require('./config');
const ChainUtil = require('../Wallets/Chain-Util');


class Block {

    constructor(timestamp, lastHash, hash, data, nonce, difficulty) {
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
    }
    toString() {
        return `Block -
          Timestamp : ${this.timestamp}
 		   Last Hash : ${this.lastHash}
           Hash      : ${this.hash}
           Difficulty: ${this.difficulty}
           	Nonce   : ${this.nonce}
	        Data	  : ${this.data}
	        `;
    }

    static genesis() {
        console.log('Genesis block');
        return new this('Genesis time', '-----', this.hash(), [],0,DIFFICULTY);
    }

    static mineBlock(lastBlock, data) {
        let hash, timestamp;
        const lastHash = lastBlock.hash;
        let { difficulty } = lastBlock;
        let nonce = 0;

        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty(lastBlock, timestamp);
            hash = Block.hash(timestamp, lastHash, data, nonce, difficulty);
        } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

        return new this(timestamp, lastHash, hash, data, nonce, difficulty);
    }

    static hash(timestamp, lastHash, data, nonce, difficulty) {
        return ChainUtil.hash(`${timestamp}${lastHash}${data}${nonce}${difficulty}`);
    }

    static blockHash(block) {
        const { timestamp, lastHash, data, nonce, difficulty } = block;
        return Block.hash(timestamp, lastHash, data, nonce, difficulty);
    }

    static adjustDifficulty(lastBlock, currentTime) {
        let { difficulty } = lastBlock;
        difficulty = lastBlock.timestamp + MINE_RATE > currentTime ?
            difficulty + 1 : difficulty - 1;
        return difficulty;
    }
}
module.exports = Block ;