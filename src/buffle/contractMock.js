

var Buffle = require('./global.js')
var config = require('config');

var txtype = require('./cwvtxtype.js')
var objectConstructor = {}.constructor;

class RpcMethod{
	constructor(contractinst,name)
	{
		this.contractinst =  contractinst;
		this.method_name = name;
		// console.log("new abi method ="+this.method_name+",inst="+contractinst)

	}

	call(){
		//在这里调用远程的方法方案
		const args = Array.from(arguments);
		var opts = {};
		if(args.length>0){
			if(args[args.length-1].constructor.name == 'Object'){
				opts = args[args.length-1];
			}
		}

		console.log("calling rpc method=="+this.method_name+",contractaddr="+this.contractinst.address
			+",from="+opts.from);

		for(var arg in args){
			console.log("arg=="+arg);
		}
	}
}

class ContractInstance{
	constructor(contract,address,txhash) {
		// code
		this.contract = contract;
		this.address = address;
		this.txhash = txhash;
		for(var abi in contract.abi)
		{
			var abidesc=contract.abi[abi];
			if(abidesc.name&&abidesc.type=='function'){
				// console.log("get abi==>"+abidesc.name+",json="+JSON.stringify(abidesc))
				var rpcM = new RpcMethod(this,abidesc.name);
				var unbound=rpcM.call;
				this[abidesc.name]=unbound.bind(rpcM)
				this[abidesc.name].call = this[abidesc.name];
			}			
		}
	}

}
class Contract {
	constructor(args) {
		// code
		this.args = args;
	}

	doDeploy(cwv,opts){
		console.log("contract = "+this.args.evm.deployedBytecode.object)
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
		var value = 0;
		if(opts.value){
			value = opts.value;	
		}
		opts.data = this.args.evm.deployedBytecode.object;
		// console.log("ntxtype=="+txtype.TYPE_CreateContract);//txtype,toAddr,amount,opts
		return  Buffle.cwv.rpc.sendTxTransaction(7,NaN,value,opts);
	}


	// methods
	deployed() {
		return this.deployPromise;
	}
}

export default{
	Contract:Contract,
	ContractInstance:ContractInstance
}
