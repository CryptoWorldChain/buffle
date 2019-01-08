

var Buffle = require('./global.js')
var config = require('config');

var txtype = require('./cwvtxtype.js')
var sleep=require('sleep');
var objectConstructor = {}.constructor;
var abi = require('ethereumjs-abi')
var accounts = require( "./accounts.js");


class RpcMethod{
	constructor(contractinst,name,m_signature,inputcounts)
	{
		this.contractinst =  contractinst;
		this.method_name = name;
		this.m_signature = m_signature;
		this.inputcounts = inputcounts;
		console.log("new abi method ="+this.method_name+",inst="+contractinst+",m_signature="+this.m_signature);
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

		console.log("calling rpc method=="+this.method_name+",contractaddr="+this.contractinst.address
			+",from="+opts.from);

		var abiargs=[];

		if(this.method_name.length==0){
			abiargs.push("default"+this.m_signature);
		}else{
			abiargs.push(this.m_signature);
		}
		for(var arg in args.slice(1)){
			var type = typeof args[arg];
			if(type=='object'){
				var vv=[];
				for(var i=0;i<args[arg].length;i++){
					vv[i]=args[arg][i];
				}
				abiargs.push(vv);
			}else{
				abiargs.push(args[arg]);
			}
			
			console.log("call "+this.m_signature+".arg["+arg+"]="+typeof(args[arg]))
		}
							// =constructor(address[]):(uint256)
		var enc;
		console.log("abi encode:"+this.method_name+",argslength="+(abiargs.length-1)+",this.inputcounts="+this.inputcounts);

		if(this.inputcounts == 0){
			enc=abi.methodID(this.method_name,[]);
		}else{
			enc = abi.simpleEncode.apply(abi,abiargs);
		}
		if(enc.length>4){
			enc = enc.slice(0,4);
		}
		if(this.method_name.length==0){
			enc = enc.slice(4)
		}		

		var encHex =  new Buffer(enc).toString('hex');

		console.log("enchex="+encHex);
		
		opts.data = encHex;
		return  Buffle.cwv.rpc.sendTxTransaction(8,this.contractinst.address,value,opts).then(function(body){
			console.log("get contract call ok:"+body)
		});
	}

	encode(){
		console.log('encode::this.m_signature='+this.m_signature)
		var args=[this.m_signature];
		for(var arg in arguments){
			var type= typeof arguments[arg];
			if(type=='object'){
				var vv=[];
				for(var i=0;i<arguments[arg].length;i++){
					vv[i]=arguments[arg][i];
				}
				args.push(vv);
			}else{
				args.push(arguments[arg]);
			}
			
			
			// console.log("call "+this.m_signature+".arg["+arg+"]="+typeof(arguments[arg]))
		}
							// =constructor(address[]):(uint256)
		var enc=abi.simpleEncode.apply(abi,args);
		if(this.m_signature.startsWith('constructor(')){
			enc = enc.slice(4);
		}
		var encHex =  new Buffer(enc).toString('hex');

		return encHex;
		// return abi.simpleEncode(this.m_signature,...args);
	}
}

class ContractInstance{
	constructor(contract,address,txhash) {
		// code
		//copy methods
		console.log("new ContractInstance,methods.length="+contract.abiMethodName.length);
		for(var i=0;i<contract.abiMethodName.length;i++)
		{ 
			var method_name  = contract.abiMethodName[i];
			var method_sig = contract.abiMethodSign[i];
			var rpcM = new RpcMethod(this,method_name,method_sig,contract.inputcounts[i]);
			var unbound=rpcM.call;
			if(method_name.length>0){
				this[method_name]=unbound.bind(rpcM)
				this[method_name].call = this[method_name];
			}else{
				this.method_default = rpcM;
			}
		}

		

		this.contract = contract;
		this.address = address;
		this.txhash = txhash;
		this.status = '';
	}

	deployed(cc){
		//check
		cc = cc||0;
		if(this.txhash&&cc<10)//调用10次
		{
			var self = this;
			return  Buffle.cwv.rpc.getTransaction(this.txhash).then(function(body){
				console.log("get tx deploy result =="+body);
				var jsbody = JSON.parse(body);
				if(jsbody.transaction&&jsbody.transaction.status){
					self.status = jsbody.transaction.status;
					return new Promise((resolve, reject) => {
						resolve(self);
					});;
				}else{
					sleep.sleep(3);
					return self.deployed(cc+1);
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


}
class Contract {
	constructor(contract) {
		// code
		this.args = contract;
		this.abiMethodName = [];
		this.abiMethodSign = [];

		this.inputcounts = [];

		for(var abi in contract.abi)
		{
			var abidesc=contract.abi[abi];

			if((abidesc.name&&abidesc.type=='function')||abidesc.type=='constructor'){
				// console.log("get abi==>"+abidesc.name+",json="+JSON.stringify(abidesc))
				var m_signature="";
				if(abidesc.name){
					m_signature = abidesc.name;
				}else{
					m_signature = "constructor";
				}
				//for input
				m_signature = m_signature+"(";

				var paramsTypes = ""
				for (var param in abidesc.inputs) {
					paramsTypes = paramsTypes + abidesc.inputs[param]["type"] + ",";
            	}
            	if(abidesc.inputs.length==0){
            		paramsTypes = "uint256,"	
            	}
            	if(paramsTypes.length>0){
            		paramsTypes = paramsTypes.substring(0,paramsTypes.length-1);
            	}
				m_signature = m_signature+paramsTypes+")";


				//for ouput
				// if(abidesc.outputs&&abidesc.outputs.length>0){
				// 	m_signature=m_signature+":(";
				// 	var paramsTypes = ""
				// 	for (var param in abidesc.outputs) {
				// 		paramsTypes = paramsTypes + abidesc.outputs[param]["type"] + ",";			
	   //          	}
	   //          	if(paramsTypes.length>0){
    //         			paramsTypes = paramsTypes.substring(0,paramsTypes.length-1);
    //         		}
				// 	m_signature=m_signature+paramsTypes+")";
				// }else{
				// 	m_signature=m_signature+":(uint256)";
				// }
				this.abiMethodName.push(abidesc.name+"")
				this.abiMethodSign.push(m_signature);
				this.inputcounts.push(abidesc.inputs.length);
				// var rpcM = new RpcMethod(NaN,abidesc.name,m_signature);
				// var unbound=rpcM.call;
				// if(abidesc.name){
				// 	this[abidesc.name]=unbound.bind(rpcM)
				// 	this[abidesc.name].call = this[abidesc.name];
				// }else
				if(abidesc.type=='constructor'){
					console.log("get constructor=="+m_signature)
					this.method_constructor = new RpcMethod(NaN,abidesc.name,m_signature);
				// }else{
				// 	this.method_default = rpcM;
				}
			}			
		}

	}

	doDeploy(opts){
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
		// console.log("method_constructor=="+this.method_constructor.encode+",sig="+this.method_constructor.m_signature)

		var args = Array.prototype.slice.call(arguments).slice(0,arguments.length-1)

		console.log("args=="+args.length);
		
		var constructorenc = this.method_constructor.encode.apply(this.method_constructor,args);
		console.log("constructorenc="+constructorenc);
		opts.data = opts.data.concat(constructorenc);
		var self = this;
		// console.log("ntxtype=="+txtype.TYPE_CreateContract);//txtype,toAddr,amount,opts
		return  Buffle.cwv.rpc.sendTxTransaction(7,NaN,value,opts).then(function (body){
				console.log("contract.doDeploy.return body=="+body)
				if(body){
					var jsbody = JSON.parse(body);
					if(jsbody.contractHash){
						var inst = new ContractInstance(self,jsbody.contractHash,jsbody.txHash)
						console.log("create Contract OKOK:"+inst.constructor.name);
						kps.increNonce();
						accounts.saveKeyStore(kps);
						return inst;
					}
				}			
				return NaN;
			})

	}


}

export default{
	Contract:Contract,
	ContractInstance:ContractInstance
}
