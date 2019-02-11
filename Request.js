/* ===== Request Class ==============================
|  Class with a constructor for Request 			   |
|  ===============================================*/

class Request {
  constructor(address) {
    this.walletAddress = address;
    this.requestTimeStamp = new Date().getTime().toString().slice(0, -3);
    this.message = '';
    this.validationWindow = 0;
  }
}

module.exports.Request = Request;