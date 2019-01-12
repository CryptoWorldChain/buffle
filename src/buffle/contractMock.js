

var Buffle = require('./global.js')
var config = require('config');

var txtype = require('./cwvtxtype.js')
var sleep=require('sleep');
var objectConstructor = {}.constructor;
var abi = require('ethereumjs-abi')
var accounts = require( "./accounts.js");
//const { Keccak } = require('sha3');
var BN=require("bn.js")
import Keccak  from "sha3";

class RpcResult {

	constructor(rpcMethod,txHash,resultObj,index){
		this.rpcMethod = rpcMethod;
		this.txHash = txHash;
		this.resultObj = resultObj;
		this.index = index||0;
		if(resultObj){
			try{
				// console.log("add result")
				if(this.rpcMethod.outputs.length==1)
				{
					this.resultObj = abi.rawDecode(this.rpcMethod.outputs, Buffer.from(resultObj,'hex'))
				}else
				if(resultObj.length==this.rpcMethod.outputs.length)
				{
					//merge result
					// console.log("merge results:"+resultObj.length+",outlen="+this.rpcMethod.outputs.length);
					var ret = {}
					for (var i = 0; i < this.rpcMethod.outputs.length && i < resultObj.length; i++) {
						// console.log("get results:"+i+"==>"+resultObj[i].toHexString());
						ret[this.rpcMethod.outputs_name[i]] = resultObj[i].toHexString();
					}
					this.resultObj = ret;
				}else
				{
					// console.log("get one results:"+resultObj+",outlen="+this.rpcMethod.outputs.length+",idx="+this.index);

					this.resultObj = abi.rawDecode([this.rpcMethod.outputs[this.index]], Buffer.from(resultObj,'hex'))
				}
			}catch(err){
				console.log("error;"+err+",resultObj="+resultObj,err)
				this.resultObj = resultObj;
			}
		}
		// console.log("new result::"+rpcMethod.method_name+",outputs="+rpcMethod.outputs+",result="+this.resultObj);
	}

	toHexString(){
		try{
			if(this.rpcMethod.outputs.length==1){
				if(this.rpcMethod.outputs[0]=='bytes32')
				{
					// console.log("setv")
					return new Buffer(this.resultObj[0]).toString('hex');
				}else if(this.resultObj[0].constructor.name=='Array'){
					return this.resultObj[0].toString('hex');
				}
			}
			if(this.resultObj){

				return this.resultObj;
			}else{
				return NaN;
			}
		}catch(error){
			return this.resultObj;
		}
	}

	getResult(cc){
		
		var self = this;
		if(this.resultObj){
			// console.log("return object directly:"+this.resultObj)
			return new Promise((resolve, reject) => {
					resolve(self);
				});
		};
		cc=cc||0;
		if(cc>30){
			return new Promise((resolve, reject) => {
				reject("timeout for get result:txhash="+this.txHash);
			});				
		}
		
		return  Buffle.cwv.rpc.getTransaction(this.txHash).then(function(body){
				// console.log("get tx  result =="+body);
				var jsbody = JSON.parse(body);
				if(jsbody.transaction&&jsbody.transaction.status){
					var result = jsbody.transaction.result;
					if(result&&jsbody.transaction.status=='D'){
						// console.log("rpcoutputlen="+self.rpcMethod.outputs.length+",="+self.rpcMethod.outputs)
						self.resultObj = abi.rawDecode(self.rpcMethod.outputs, Buffer.from(result,'hex'))
						return new Promise((resolve, reject) => {
							resolve(self);
						});
					}else{
						return new Promise((resolve, reject) => {
							self.resultObj = "tx invoke error:"+self.txHash+",status="+jsbody.transaction.status+",result="+ jsbody.transaction.result
							resolve(self);
						});
					}					
				}else{
					sleep.sleep(2);
					return self.getResult(cc+1);
				}

		});
	}
}
class RpcMethod{
	constructor(contractinst,name,m_signature,inputcounts,outputs,outputs_name,constFieldID)
	{
		this.contractinst =  contractinst;
		this.method_name = name;
		this.m_signature = m_signature;
		this.inputcounts = inputcounts;
		this.outputs = outputs;
		this.outputs_name = outputs_name
		this.constFieldID = constFieldID;

		// console.log("new abi method ="+this.method_name+",inst="+contractinst+",m_signature="+this.m_signature
		// 	+",outputs="+JSON.stringify(this.outputs));
	}
	sha3encode(key){
		var hash=new Keccak(256);
		hash.update(Buffer.from(key,'hex'));

		var keyhex=new Buffer(hash.digest()).toString('hex');
		// console.log("keyhex="+keyhex);
		return keyhex;
	}

	requestConst(args){
		//is const.
		//console.log("requestConst,args==="+args.length);

		var key = "";
		var field=""+this.constFieldID;
		for(var i in args){
			var pad = args[i];
			// console.log("requestConst,args["+i+"]=="+pad);
			if(pad.startsWith("0x")){
				pad = pad.slice(2);
			}
			key = pad.padStart(64,'0')+key;
			if(i==0){
				key = this.sha3encode(key+field.padStart(64,'0'))
			}else{
				key = this.sha3encode(key)
			}
		}
		if(args.length==0){
			key=field.padStart(64,'0');
		}

		// console.log("keyhex="+key);

		return key;

	}

	call(){
		//在这里调用远程的方法方案
		var args = Array.from(arguments);
		var opts = {};
		if(args.length>0){
			if(args[args.length-1].constructor.name == 'Object'){
				opts = args[args.length-1];
				args= args.slice(0,args.length-1);
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

		// console.log("calling rpc method=="+this.method_name+",contractaddr="+this.contractinst.address
		// 	+",from="+opts.from+",constFieldID="+this.constFieldID);

		var abiargs=[];
		if(this.constFieldID<0){
//	normal method
			if(this.method_name.length==0){
				abiargs.push("default"+this.m_signature);
			}else{
				abiargs.push(this.m_signature);
			}
			for(var arg in args){
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
				// console.log("call ."+this.m_signature+".arg["+arg+"]="+typeof(args[arg])+",v="+args[arg])
			}
			// =constructor(address[]):(uint256)

			var enc;
			// console.log("abi encode:"+this.method_name+",argslength="+(abiargs.length-1)+",this.inputcounts="+this.inputcounts);

			if(this.inputcounts == 0){
				enc=abi.methodID(this.method_name,[]);
			}else{
				enc = abi.simpleEncode.apply(abi,abiargs);
			}

			
			if(this.method_name.length==0){
				if(enc.length>4){
					enc = enc.slice(0,4);
				}
				enc = enc.slice(4)
			}		
			//


			var encHex =  new Buffer(enc).toString('hex');

			// console.log("enchex="+encHex);
			
			opts.data = encHex;
			var self = this;

			return  Buffle.cwv.rpc.sendTxTransaction(8,this.contractinst.address,value,opts).then(function(body){
				// console.log("get tx deploy result =="+body);
				var jsbody = JSON.parse(body);
				if(jsbody.txHash){
					return new Promise((resolve, reject) => {

						kps.increNonce();
						accounts.saveKeyStore(kps);

						resolve(new RpcResult(self,jsbody.txHash));
					});

				}else{
					return new Promise((resolve, reject) => {
						reject("send tx error:"+body);
					});
				}
			});
		}else{
			var hex=this.requestConst(args);
			var self = this;
			var p=[]
			var getp=function(idx){
				return Buffle.cwv.rpc.getStorageValue([self.contractinst.address,hex]).then(function(body){
					// console.log("get storage by key=="+self.method_name+",body="+body);
					var jsbody = JSON.parse(body);
					if(jsbody.content){
						return new Promise((resolve, reject) => {
							resolve(new RpcResult(self,hex,jsbody.content[0],idx));
						});
					}else{
						return new Promise((resolve, reject) => {
							resolve(new RpcResult(self,hex,"",idx));
						})
					}
				})
			}
			for(var i=0;i<this.outputs.length;i++){
				var req=getp(i);
				p.push(req);
				hex = new BN(hex,'hex').add(new BN(1)).toString(16).padStart(64,'0');
			}
			if(p.length==1){
				return p[0]
			}			
			return Promise.all(p).then(function(values){
				// console.log("get values:"+values);
				// var ret = {}
				// for(var i=0;i<this.outputs.length;i++){
				// 	ret[this.outputs[i].name]=values[i].toHexString();
				// }
				return new Promise((resolve, reject) => {
						resolve(new RpcResult(self,hex,values,values.length));
				})
			});
		}
	}

	encode(){
		// console.log('encode::this.m_signature='+this.m_signature)
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
			
			
			// 
		}
		var enc;
		if(args.length > 1){
			// args.push(1);
			enc= abi.simpleEncode.apply(abi,args);
		}else{
			enc = abi.methodID(this.m_signature,[]);
		}
							// =constructor(address[]):(uint256)
	
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
		// console.log("new ContractInstance,methods.length="+contract.abiMethodName.length);
		for(var i=0;i<contract.abiMethodName.length;i++)
		{ 
			var method_name  = contract.abiMethodName[i];
			var method_sig = contract.abiMethodSign[i];

			var constFieldID = contract.constFields.indexOf(method_name);
			// console.log("contract.constFields=="+JSON.stringify(contract.constFields)+",methodname="+method_name
			// 	+",index="+constFieldID);
			var rpcM = new RpcMethod(this,method_name,method_sig,contract.inputcounts[i],contract.outputs[i],
				contract.outputs_name[i],constFieldID);
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
				// console.log("get tx deploy result =="+body);
				var jsbody = JSON.parse(body);
				if(jsbody.transaction&&jsbody.transaction.status){
					self.status = jsbody.transaction.status;
					return new Promise((resolve, reject) => {
						resolve(self);
					});;
				}else{
					sleep.sleep(1);
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
		this.outputs = [];
		var constFileds= [];
		this.outputs_name = [];
		var lines=contract.evm.assembly.split("\n");
		var codelines = [];
		var codedef = "";
		var codes = ""
		for(var i =0;i<lines.length;i++)
		{
			var line = lines[i].trim();
			if(line.startsWith("/*")||line.endsWith("*/")){
				codelines.push(codedef);
				codelines.push(codes);
				codedef = line;
				codes = "";
			}else
			{
				codes = codes+lines[i].trim();
			}
		}
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
            	if(paramsTypes.length>0){
            		paramsTypes = paramsTypes.substring(0,paramsTypes.length-1);
            	}
				m_signature = m_signature+paramsTypes+")";


				//for ouput
				var outs = [];
				var outs_name = [];
				if(abidesc.outputs){
					for (var param in abidesc.outputs) {
						outs.push(abidesc.outputs[param]["type"]);	
						outs_name.push(abidesc.outputs[param]["name"]);		
	            	}
	            	
				}
				this.outputs.push(outs)
				this.outputs_name.push(outs_name)
				this.abiMethodName.push(abidesc.name+"")
				this.abiMethodSign.push(m_signature);
				this.inputcounts.push(abidesc.inputs.length);
				if(abidesc.type=='constructor'){
					// console.log("get constructor=="+m_signature)
					this.method_constructor = new RpcMethod(NaN,abidesc.name,m_signature);
				}
				// console.log("abidesc.constant=="+abidesc.constant+",length="+codelines.length)
				if(abidesc.constant){
					var idfound = -1;
					
					for(var li =0;li<codelines.length-1;li+=2){
						var trydef=codelines[li].split(" ");
						if(trydef[3]==abidesc.name){
							var trycode = codelines[li+1].split(" ");
							
							if(trycode.length==1&&trycode[0].startsWith("0x") && 
								Number.parseInt(trycode[0],16).toString(16).length==trycode[0].length - 2
								){

								idfound = Number.parseInt(trycode[0].substring(2),16);

								// console.log("try:"+abidesc.name+",line="+codelines[li]+",trycode="+trycode+",found;"+idfound)
							}
						}
					}
					if(idfound>=0){
						constFileds.push({name:abidesc.name,idx:idfound});
					}
						

				}
			}			
		}
		this.constFields =  constFileds.sort(function (a, b) {
		  return (a.idx - b.idx)
		}).map(function(cb){return cb.name})


		// this.constFields = this.constFields.sort();


	}

	doDeploy(opts){
		// console.log("contract = "+this.args.evm.deployedBytecode.object)
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
		opts.data = this.args.evm.bytecode.object;
		// console.log("method_constructor=="+this.method_constructor.encode+",sig="+this.method_constructor.m_signature)

		var args = Array.prototype.slice.call(arguments).slice(0,arguments.length-1)

		// console.log("args=="+args.length);
		
		var constructorenc = this.method_constructor.encode.apply(this.method_constructor,args);
		// console.log("constructorenc="+constructorenc);
		opts.data = opts.data.concat(constructorenc);
		var self = this;
		// console.log("ntxtype=="+txtype.TYPE_CreateContract);//txtype,toAddr,amount,opts
		return  Buffle.cwv.rpc.sendTxTransaction(7,NaN,value,opts).then(function (body){
				// console.log("contract.doDeploy.return body=="+body)
				if(body){
					var jsbody = JSON.parse(body);
					if(jsbody.contractHash){
						var inst = new ContractInstance(self,jsbody.contractHash,jsbody.txHash)
						// console.log("create Contract OKOK:"+inst.constructor.name);
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
	ContractInstance:ContractInstance,
}
