

import Buffle from './global';
import config from 'config';
import BN  from "bn.js";
import accounts from "./accounts";

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
		console.log("new value="+value);
		return  Buffle.cwv.rpc.transfer(to,value,opts);
	}
module.exports.getBalance =function  (addr,opts){
	// console.log("cwv mockup getBalance");
	return Buffle.cwv.rpc.getBalance(addr,opts);
}

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
			var kps = Buffle.keypairs[from];
			if(kps&&nonce!=kps.nonce){
				kps.setNonce(nonce);
				accounts.saveKeyStore(kps);
			}
		}else{
			console.log("nonce not found");
		}
	});
}

