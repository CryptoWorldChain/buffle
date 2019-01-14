

import Buffle from './global';
import config from 'config';
import BN  from "bn.js";
import accounts from "./accounts";
import sleep from 'sleep';
class TranserResult{

	constructor(txhash,kps,result){
		this.txhash=txhash
		this.kps=kps;
		this.result = result;
	}
	done(cc){
		cc = cc||0;
		var self = this;
		if(self.txhash&&cc<10)//调用10次
		{
			return  Buffle.cwv.rpc.getTransaction(self.txhash).then(function(body){
				// console.log("get tx deploy result =="+body);
				var jsbody = JSON.parse(body);
				if(jsbody.transaction&&jsbody.transaction.status){
					if(self.kps){
						self.kps.increNonce();
						accounts.saveKeyStore(self.kps);
					}
					return new Promise((resolve, reject) => {
						resolve(jsbody.transaction.status);
					});;
				}else{
					sleep.sleep(1);
					return self.done(cc+1);
				}
			});
		}else
		if(!this.txhash)
		{
			return new Promise((resolve, reject) => {
				reject("txhash not found");
			});
		}else{
			return new Promise((resolve, reject) => {
				reject("call timeout::"+cc+",txhash="+self.txhash);
			});
		}

	}
}
module.exports.transfer =function (to,value,opts){
		opts = opts||{};
		var from = opts.from;
		if(!from){
			if(config.accounts.default&&config.accounts.default.length>20){
				opts.from = config.accounts.default;
			}else{
				opts.from = Buffle.accounts[0];
			}
			from  = opts.from;
		}
		var kps = Buffle.keypairs[from];
		if(!kps){
			return new Promise((resolve, reject) => {
				reject("keypair not found for address="+from);
			});;
		}
		opts.keypair = kps;
		// console.log("from=="+opts.from+",kp="+kps.hexAddress);
		// console.log("opts=="+JSON.stringify(opts));
		value = new BN(value).mul(new BN("10").pow(new BN("18")))
		// console.log("new value="+value);
		return  Buffle.cwv.rpc.transfer(to,value,opts).then(function(ret){
			var jsbody = JSON.parse(ret);
			if(jsbody.txHash){
				return new Promise((resolve, reject) => {
					resolve(new TranserResult(jsbody.txHash,kps));
				}); 
			}else{
				return new Promise((resolve, reject) => {
					reject("txhash not found");
				}); 
			}
		});
	}

module.exports.getBalance =function  (addr,opts){
	// console.log("cwv mockup getBalance");
	return Buffle.cwv.rpc.getBalance(addr,opts);
}
var __waitTxDone = function(txhash,cc){
	//check
	cc = cc||0;
	if(txhash&&cc<10)//调用10次
	{
		return  Buffle.cwv.rpc.getTransaction(txhash).then(function(body){
			// console.log("get tx deploy result =="+body);
			var jsbody = JSON.parse(body);
			if(jsbody.transaction&&jsbody.transaction.status){
				return new Promise((resolve, reject) => {
					resolve(jsbody.transaction.status);
				});;
			}else{
				sleep.sleep(1);
				return __waitTxDone(txhash,cc+1);
			}
		});
	}else
	if(!this.txhash)
	{
		return new Promise((resolve, reject) => {
			reject("txhash not found");
		});
	}else{
		return new Promise((resolve, reject) => {
			reject("call timeout");
		});
	}
	

}
module.exports.waitTxDone = __waitTxDone;

module.exports.checkAndSetNonce =function  (addr,opts){
	opts = opts||{};
	var from = opts.from;
	if(!from){
		if(config.accounts.default&&config.accounts.default.length>20){
			opts.from = config.accounts.default;
		}else{
			opts.from = Buffle.accounts[0];
		}
		from  = opts.from;
	}

	return Buffle.cwv.rpc.getBalance(addr,opts).then(function(body){
		// console.log("checkAndSetNonce get::"+body);
		var jsBody = JSON.parse(body);
		var nonce = jsBody.account.nonce;
		if(nonce){
			var kps = Buffle.keypairs[addr];
			if(kps&&nonce!=kps.nonce){
				kps.setNonce(nonce);
				accounts.saveKeyStore(kps);
			}
		}else{
			console.log("nonce not found");
		}
		return body;
	});
}

function getKeyPairs(opts){
	opts = opts||{};
	var from = opts.from;
	if(!from){
		if(config.accounts.default&&config.accounts.default.length>20){
			opts.from = config.accounts.default;
		}else{
			opts.from = Buffle.accounts[0];
		}
		from  = opts.from;
	}
	var kps = Buffle.keypairs[from];
	if(!kps){
		return new Promise((resolve, reject) => {
			reject("keypair not found for address="+from);
		});;
	}
	opts.keypair = kps;
	return opts;
}
module.exports.createCRC20 =function  (args,opts){
	console.log("cwv mockup createCRC20");
	return Buffle.cwv.rpc.createCRC20({
		token:args.token,amount:args.amount
	},getKeyPairs(opts));
}
module.exports.callCRC20 =function  (args,opts){
	console.log("cwv mockup callCRC20");
	return Buffle.cwv.rpc.callCRC20({
		token:args.token,amount:args.amount,to:args.to
	},getKeyPairs(opts));
}

module.exports.createCRC721 =function  (args,opts){
	console.log("cwv mockup createCRC721");
	return Buffle.cwv.rpc.createCRC721(args,getKeyPairs(opts));
}
module.exports.callCRC721 =function  (args,opts){
	console.log("cwv mockup callCRC721");
	return Buffle.cwv.rpc.callCRC721(args,getKeyPairs(opts));
}