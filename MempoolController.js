const Request = require('./Request.js');

class MempoolController {
	constructor(app, blockchainObj, mempoolObj) {
        this.app = app;
        this.blocks = blockchainObj;
        this.mempool = mempoolObj;
        this.requestValidation();
        this.searchRequestValidation();
        this.validataSignature();
	}

    requestValidation() {
        this.app.post("/requestValidation", (req, res) => {  
            if (req.body.address) {
            	let requestObj = new Request.Request(req.body.address);
            	this.mempool.addARequestValidation(requestObj).then((obj) => {
            		if (obj) {
            			return res.status(200).send(obj);
             		} else {
             			return res.status(500).send("Something went wrong");
             		}
            	}).catch((error) => { return res.status(500).send("Something went wrong"); })
            } else {
            	return res.status(500).send("Check the Body Parameter!");
            }
        });
    }

    validataSignature() {
    	this.app.post("/message-signature/validate", (req, res) => {
    		if (req.body.address && req.body.signature) {
    			this.mempool.validateRequestByWallet(req.body.address, req.body.signature).then((result) => {
    				return res.status(200).send(result);
    			}).catch((error) => { res.status(500).send("Something went wrong"); })
    		} else {
    			res.status(500).send("Check the Body Parameter!");
    		}
    	})
    }
}

module.exports = (app, blockchainObj, mempoolObj) => { return new MempoolController(app, blockchainObj, mempoolObj);}