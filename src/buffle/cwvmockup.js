

import Buffle from './global';
import config from 'config';


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
		// console.log("opts=="+JSON.stringify(opts));
		return  Buffle.cwv.rpc.transfer(to,value,opts);
	}
module.exports.getBalance =function  (addr,opts){
	console.log("cwv mockup getBalance");
	return Buffle.cwv.rpc.getBalance(addr,opts);
}
