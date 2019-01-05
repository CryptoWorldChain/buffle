



class RpcMethod{
	constructor(contractinst,name)
	{
		this.contractinst =  contractinst;
		this.method_name = name;
		// console.log("new abi method ="+this.method_name+",inst="+contractinst)

	}
	call(){
		//在这里调用远程的方法方案
		console.log("calling method=="+this.method_name+",contractaddr="+this.contractinst.address);
		for(var arg in arguments){
			console.log("arg=="+arg);
		}
	}
}

var RpcCall = function(){
	if(!this.name)
	{
		this.name = NaN;
	}
	console.log("calling method=="+this.name+",args="+arguments);


}
class ContractInstance{
	constructor(contract,address) {
		// code

		this.contract = contract;
		this.address = address;
		for(var abi in contract.abi)
		{
			var abidesc=contract.abi[abi];
			if(abidesc.name&&abidesc.type=='function'){
				console.log("get abi==>"+abidesc.name+",json="+JSON.stringify(abidesc))
				var rpcM = new RpcMethod(this,abidesc.name);
				var unbound=rpcM.call;
				this[abidesc.name]=unbound.bind(rpcM)
				this[abidesc.name].call = this[abidesc.name];
			}

			
		}
	}

}
class Contract {
	constructor(opts) {
		// code
		this.opts = opts;

	}

	doDeploy(cwv){
		this.deployPromise= new Promise((resolve, reject) => {
			//TODO !在哪里发布合约到链上
			resolve(new ContractInstance(this.opts,"0xdf2fc3cdc723c8f5be2f51b5d051ace6264008ad"));
		})
		return this.deployPromise;
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
