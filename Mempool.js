/* ===== Mempool Class ==============================
|  Class with a constructor for Mempool 			   |
|  ===============================================*/

const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message'); 
const Request = require('./Request.js');
const RequestValid = require('./RequestValid.js');

const TimeoutRequestsWindowTime = 5*60*1000;

class Mempool {
	constructor() {
		this.mempool = [];
        this.timeoutRequests = [];
        
        this.mempoolValid = [];
        this.timeoutMempoolValid = [];
	}

	addARequestValidation(request) {
		let self = this;
		return new Promise((resolve, reject) => {
			if (request.walletAddress) {
				let address = request.walletAddress;
				self.searchRequestByWalletAddress(address).then((result) => {
					// add the new request in mempool
					if (result === undefined) {
						let currentTime = new Date().getTime().toString().slice(0,-3);
					    let newRequestValidation = {
        					walletAddress: address,
        					requestTimeStamp: currentTime,
        					//message: [request.walletAddress, currentTime, 'starRegistry'].join(':'),
					        message: `${address}:${currentTime}:starRegistry`,
        					validationWindow: TimeoutRequestsWindowTime/1000
    					};
    					self.mempool.push(newRequestValidation);
 						self.timeoutRequests[address] = setTimeout(function(){ self.removeValidationRequest(address) }, TimeoutRequestsWindowTime );
    					resolve(newRequestValidation);

					} else {
				        let currentTime = new Date().getTime().toString().slice(0, -3);
        				let timeElapsed = currentTime - result.requestTimeStamp;
        				let newValidationWindow = (TimeoutRequestsWindowTime/1000) - timeElapsed;
        				result.validationWindow = newValidationWindow;
  						resolve(result)
					}
				}).catch((err) => { console.log(err); reject(err); });
			} else {
				reject(error("Error in addARequestValidation"));
			} 
		}).catch((err) => { console.log(err); reject(err); });
	}

	removeValidationRequest(address) {
    	this.mempool = this.mempool.filter(mem => {
    		return mem.walletAddress != address;
    	});
		delete this.timeoutRequests[address];
	}

	removeValidRequest(address) {
    	this.mempoolValid = this.mempoolValid.filter(mem => {
    		return mem.status.walletAddress != address;
    	});
		delete this.timeoutMempoolValid[address];
	}

	searchRequestByWalletAddress(address) {
		let self = this;
		return new Promise ((resolve, reject) => {
		    let isAddressExist = false;
    		self.mempool.forEach(mem => {
      			if (mem.walletAddress == address) {
        			isAddressExist = true;
      		  		resolve(mem);
      			}
    		});
    		if (!isAddressExist) {
    			resolve(undefined);
    		}
		}).catch((error) => { console.log("Something went wrong!"); } )
	}

	searchRequestByWalletAddressValid(address) {
		let self = this;
		return new Promise ((resolve, reject) => {
		    let isAddressExist = false;
    		self.mempoolValid.forEach(mem => {
      			if (mem.status.address == address) {
        			isAddressExist = true;
      		  		resolve(mem);
      			}
    		});
    		if (!isAddressExist) {
    			resolve(undefined);
    		}
		}).catch((error) => { console.log("Something went wrong!"); } )
	}

	validateRequestByWallet(address, signature) {
		let self = this;
		return new Promise((resolve, reject) => {
			self.searchRequestByWalletAddress(address).then((result) => {
				if (result) {
					let isValid = bitcoinMessage.verify(result.message, address, signature);
					let reqObjValidate = new RequestValid.RequestValid(result, isValid);
					if (isValid) {
						let timeElapse = (new Date().getTime().toString().slice(0,-3)) - reqObjValidate.status.requestTimeStamp;
						let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
						reqObjValidate.status.validationWindow = timeLeft;
						self.mempoolValid.push(reqObjValidate);
						self.timeoutMempoolValid[reqObjValidate.address] = setTimeout(function(){ self.removeValidRequest(reqObjValidate.status.walletAddress) }, TimeoutRequestsWindowTime );
					}
					resolve(reqObjValidate);
				} else {
					resolve(undefined);
				}
			}).catch((error) => { console.log("Something went wrong!"); } )
		});
	}

}

// Export the class
module.exports.Mempool = Mempool;