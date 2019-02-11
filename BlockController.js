const SHA256 = require('crypto-js/sha256');
const Block = require('./Block.js');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app, blockchainObj, mempoolObj) {
        this.app = app;
        this.blocks = blockchainObj;
        this.mempool = mempoolObj;
        this.getBlockByIndex();
        this.getStarBlockByHash();
        this.getStarBlockByAddress();
        this.postNewBlock();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/block/:index"
     */
    getBlockByIndex() {
        let self = this;
        try {
            self.app.get("/block/:index", async (req, res) => {
                let index = req.params.index;
                try {
                    let block = await self.blocks.getBlockByHeight(index);
                    return res.status(200).json(block);
                } catch (error) {
                    return res.status(404).json({status: 404, message: 'Block not found'});
                }
            });
        } catch (error) {
            return res.status(404).json({status: 404, message: 'Block not found'});
        }
    }

     /**
     * Implement a POST Endpoint to retrieve a block by hash, url: "/stars/hash:[HASH]"
     */
    getStarBlockByHash() {
        let self = this;
        try {
            self.app.get("/stars/hash:HASH", async (req, res) => {
                let hash = req.params.HASH.slice(1);
                 try {
                    let block = await self.blocks.getBlockByHash(hash);
                    return res.status(200).json(block);
                } catch (error) {
                    return res.status(404).json({status: 404, message: 'Block not found'});
                }
            });
        } catch (error) {
            return res.status(404).json({status: 404, message: 'Block not found'});
        }
    }

     /**
     * Implement a POST Endpoint to retrieve a block by address, url: "/stars/address:[ADDRESS]"
     */
    getStarBlockByAddress() {
        let self = this;
        try {
            self.app.get("/stars/address:ADDRESS", async (req, res) => {
                let address = req.params.ADDRESS.slice(1);
                 try {
                    let block = await self.blocks.getBlockByWalletAddress(address);
                    return res.status(200).json(block);
                } catch (error) {
                    return res.status(404).json({status: 404, message: 'Blocks not found'});
                }
            });
        } catch (error) {
            return res.status(404).json({status: 404, message: 'Blocks not found'});
        }
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/block"
     */
    postNewBlock() {
        this.app.post("/block", (req, res) => {
            if (req.body.address && req.body.star) {
                this.mempool.searchRequestByWalletAddressValid(req.body.address).then((result) => {
                    if (result) {
                        let RA = req.body.star.ra;
                        let DEC = req.body.star.dec;
                        let MAG = req.body.star.mag;
                        let CEN = req.body.star.cen;
                        let starStory = req.body.star.story;
                        if (RA && DEC) {
                            let body = {
                                address: req.body.address,
                                star: {
                                    ra: RA,
                                    dec: DEC,
                                    mag: MAG,
                                    cen: CEN,
                                    story: Buffer(starStory).toString('hex')
                                }
                            };
                            let block = new Block.Block(body);
                            this.blocks.addBlock(block).then((result) => {
                                if (result) {
                                    this.mempool.removeValidRequest(req.body.address);
                                    return res.status(200).json(block);
                                } else {
                                    return res.status(500).send("Something went wrong!");
                                }
                            }).catch((error) => { return res.status(500).send("Something went wrong!"); })
                        } else {
                            return res.status(500).send("Check the Body Parameter!");
                        }
                    } else {
                        return res.status(401).json("The address couldn't be found!");
                    }
                })

            } else {
                return res.status(500).send("Check the Body Parameter!");
            }

        });
    }
}

module.exports = (app, blockchainObj, mempoolObj) => { return new BlockController(app, blockchainObj, mempoolObj);}