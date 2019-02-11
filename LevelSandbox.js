/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/
// Importing the module 'level'
const level = require('level');
// Declaring the folder path that store the data
const chainDB = './chaindata';

const hex2ascii = require('hex2ascii');

// Declaring a class
class LevelSandbox {
	// Declaring the class constructor
    constructor() {
    	this.db = level(chainDB);
    }
  
  	// Get data from levelDB with key (block height)
   	getLevelDBData(key){
        let self = this; // because we are returning a promise we will need this to be able to reference 'this' inside the Promise constructor
        return new Promise(function(resolve, reject) {
            self.db.get(key, (err, value) => {
                if(err){
                    if (err.type == 'NotFoundError') {
                        resolve(undefined);
                    }else {
                        console.log('Block ' + key + ' get failed', err);
                        reject(err);
                    }
                }else {
                    let block = JSON.parse(value);
                    if (key > 0) {
                        block.body.star.storyDecoded = hex2ascii(block.body.star.story);
                    }
                    resolve(block);
                }
            });
        });
    }

    // Get block by hash
    getBlockByHash(hash) {
        let self = this;
        let block = null;
        return new Promise(function(resolve, reject){
            self.db.createReadStream()
            .on('data', function (data) {
                let blockObj = JSON.parse(data.value);
                if( blockObj.hash == hash){
                     block = blockObj;
                    if (block.height > 0) {
                        block.body.star.storyDecoded = hex2ascii(block.body.star.story);
                    }
                 }
            })
            .on('error', function (err) {
                reject(err)
            })
            .on('close', function () {
                resolve(block);
            });
        });
    }
  
    // Get block array by address
    getBlockByAddress(address) {
        let self = this;
        let blocks = [];
        let block = null;
        return new Promise(function(resolve, reject){
            self.db.createReadStream()
            .on('data', function (data) {
                let block = JSON.parse(data.value);
                if( block.height > 0 && block.body.address == address){
                    block.body.star.storyDecoded = hex2ascii(block.body.star.story);
                    blocks.push(block);
                }
            })
            .on('error', function (err) {
                reject(err)
            })
            .on('close', function () {
                resolve(blocks);
            });
        });
    }

  	// Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.put(key, value, function(err) {
                if (err) {
                    console.log('Block ' + key + ' submission failed', err);
                    reject(err);
                }
                resolve(value);
            });
        });
    }

    // Add data to levelDB with value
    addDataToLevelDB(value) {
        let self = this;
        let i = 0;
        return new Promise(function(resolve, reject) {
            self.db.createReadStream()
                .on('data', function(data) {
                    i++;
                })
                .on('error', function(err) {
                    console.log('Unable to read data stream!', err);
                    reject(err);
                })
                .on('close', function() {
                    console.log('Block #' + i);
                    self.addLevelDBData(i, value);
                });
        })
    }
  
  	/**
     * Step 2. Implement the getBlocksCount() method
     */
    getBlocksCount() {
        let self = this;
        // Add your code here
        let count = 0;
        return new Promise(function(resolve, reject) {
            self.db.createReadStream()
                .on('data', function (data) {
                    count += 1;
                })
                .on('error', function (err) {
                    reject(err);
                })
                .on('close', function () {
                    resolve(count);
                })
                .on('end', function () {
                    resolve(count);
                });
        });
    }
}

// Export the class
module.exports.LevelSandbox = LevelSandbox;