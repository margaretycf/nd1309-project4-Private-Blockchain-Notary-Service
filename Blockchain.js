/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandboxClass = require('./LevelSandbox.js');
const db = new LevelSandboxClass.LevelSandbox();
const Block = require('./Block.js');



/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
    this.createGenesisBlock();
  }

  createGenesisBlock(){
    let self = this;
    return new Promise(function(resolve, reject) {
       self.getBlockHeight().then((height) => {
        if (height < 0) {
          let genesisBlock = new Block.Block("First block in the chain - Genesis block");
          genesisBlock.hash = SHA256(JSON.stringify(genesisBlock)).toString();
          db.addLevelDBData(genesisBlock.height, JSON.stringify(genesisBlock).toString()).then((result) => {
            if(!result) {
              console.log("Error Adding Genesis block object to chain");
            } else {
              console.log(result);
            }
          }).catch((err) => { console.log(err); })
        }
      }).catch((err) => { console.log(err); })
    });

  }

  // Add new block
  async addBlock(newBlock){
    let self = this;
    return new Promise(function(resolve, reject) {
      // Block height
      self.getBlockHeight().then((height) => {
        newBlock.height = height + 1;
        newBlock.time = new Date().getTime().toString().slice(0,-3);

        if (newBlock.height > 0) {
          self.getBlockByHeight(newBlock.height - 1).then((pre_block) => {
            newBlock.previousBlockHash = pre_block.hash;
            newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    
            // Adding block object to chain
            db.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString()).then((result) => {
              if(!result) {
                reject(error("Error Adding block object to chain"));
              } else {
                //result.body.star.storyDecoded = hex2ascii(result.body.star.story);
                resolve(result);
              }
            }).catch((err) => { reject(err); })
          }).catch((err) => { console.log(err); reject(err) });

        // this is Genesis block creation
        } else {
          newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
      
          // Adding block object to chain
          db.addLevelDBData(newBlock.height, JSON.stringify(newBlock).toString()).then((result) => {
            if(!result) {
              reject(error("Error Adding block object to chain"));
            } else {
              resolve(result);
            }
          }).catch((err) => { reject(err); })
        }

      }).catch((err) => { reject(err); });
    });
  }

  // Get block height
  getBlockHeight(){
    return new Promise(function (resolve, reject) {
      db.getBlocksCount().then((count) => {
        resolve(count - 1);
      }).catch((err) => { reject(err) });
    });
  }

  // get block by height
  getBlockByHeight(blockHeight){
    return new Promise(function (resolve, reject) {
      db.getLevelDBData(blockHeight).then((block) => {
        if (block === undefined) {
          reject('Not found');
        }
        resolve(block);
      }).catch((err) => { reject(err) });
    });
  }

  // Get block by hash
  getBlockByHash(hash) {
    return new Promise(function (resolve, reject) {
      db.getBlockByHash(hash).then((block) => {
        if (block === null) {
          reject('Not found');
        }
        resolve(block);
      }).catch((err) => { reject(err) });
    });
  }

  // get blocks by wallet address
  getBlockByWalletAddress(address){
    return new Promise(function (resolve, reject) {
      db.getBlockByAddress(address).then((blocks) => {
        if (blocks === null) {
          reject('Not found');
        }
        resolve(blocks);
      }).catch((err) => { reject(err) });
    });
  }

  // validate block
  async validateBlock(blockHeight){
    let self = this;
    return new Promise(function (resolve, reject) {
      // get block object
      self.getBlockByHeight(blockHeight).then((block) => {
        // get block hash
        let blockHash = block.hash;
        // remove block hash to test block integrity
        block.hash = '';
        // generate block hash
        let validBlockHash = SHA256(JSON.stringify(block)).toString();
        // Compare
        if (blockHash===validBlockHash) {
          resolve(true);
        } else {
          console.log('Block #'+blockHeight+' invalid hash:\n'+blockHash+'<>'+validBlockHash);
          resolve(false);
        }
      });
    })
  }

  // validate link - make sure that the current block links to the previous block   
  async validateLink(blockHeight){
    let self = this;
    return new Promise(function (resolve, reject) {
      self.getBlockByHeight(blockHeight).then((current_block) => {
        self.getBlockByHeight(blockHeight - 1).then((previous_block) => {
          if (previous_block.hash === current_block.previousBlockHash) {
            resolve(true);
          } else {
            resolve(false);
          }
        }).catch((err) => reject(err));
      }).catch((err) => reject(err));
    });
  }
      
  // Validate blockchain
  async validateChain(){
    let height = await this.getBlockHeight();
    let block_validation = [];
    let link_validation = [];

    try {
      // validate genesis block
      block_validation.push(await this.validateBlock(0));
      // validate further blocks and their links
      for (let i = 1; i < height + 1; i++) {
        block_validation.push(await this.validateBlock(i));
        link_validation.push(await this.validateLink(i));
      }

      return Promise.all(block_validation.concat(link_validation)).then((results) => {
        let blockChainIsValid = !results.includes(false);
        console.log('Block chain validation result: ' + blockChainIsValid);
        console.log('Block chain is ' + (blockChainIsValid ? 'valid' : 'invalid'));
        return blockChainIsValid;
      });

    } catch (err) {
      console.log(err);
    }
  }


  // Utility Method to Tamper a Block for Test Validation
  // This method is for testing purpose
  _modifyBlock(height, block) {
      return new Promise((resolve, reject) => {
          db.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
              resolve(blockModified);
          }).catch((err) => { console.log(err); reject(err) });
      });
  }

}

// Export the class
module.exports.Blockchain = Blockchain;