var sleep = require('sleep')


var CWVRandImpl = artifacts.require("CWVRandImpl");


contract('#testall', function(accounts) {

	console.log("test my boy:accounts=="+accounts+",cwv="+JSON.stringify(cwv))
	// console.log("it=="+it);
	it('test.1-getsetnoncebalance', async function(accounts) {

		var p = cwv.checkAndSetNonce(accounts[0]).then(function(body){
			// console.log("get body:"+body);
			return cwv.checkAndSetNonce(accounts[1]);
		}).catch(function (error){
			console.log("get error:"+error);
		});
		await p;
		// sleep.sleep(10);

		// p = cwv.transfer(accounts[1],1000000).then(function(body){
		// 	console.log("get body:"+body);
		// }).catch(function (error){
		// 	console.log("get error:"+error);
		// });
		// await p;
		
		var randInst = NaN;
		var p = deployer.deploy(CWVRandImpl,{from:accounts[0]}).then(function(inst){
			console.log("get TokenStore deploying inst.address=="+inst.address+",txhash = "+inst.txhash);
			randInst=inst;

			return randInst;
		});

		await p;

		console.log("get ManagerInst="+randInst.address);

		var p1=randInst.deployed().then(function(inst){
			console.log("deployed inst.address=="+inst.address+",txhash = "+inst.txhash);
			//transfer to contract
			randInst = inst;
		}).catch(function (error){
			console.log("transfer error:"+error,error);
		}).then(function(deployed){
			return randInst.getBlockNum().then(function(rpcresult){
					// console.log("manInst.checkManager.callback=="+rpcresult);
					return rpcresult.getResult().then(function(ret){
						console.log("randInst.getBlockNum.rpcresult=="+ret.toHexString());
					}) 
			})
		})
		.then(function(deployed){
			return randInst.generateRnd().then(function(rpcresult){
					// console.log("manInst.checkManager.callback=="+rpcresult);
					return rpcresult.getResult().then(function(ret){
						console.log("randInst.generateRnd.rpcresult=="+ret.toHexString());
					}) 
			})
		})
		.then(function(deployed){
			return randInst.generateRnd1(new Date().getTime(),100).then(function(rpcresult){
					// console.log("manInst.checkManager.callback=="+rpcresult);
					return rpcresult.getResult().then(function(ret){
						console.log("randInst.generateRnd1.rpcresult=="+ret.toHexString());
					}) 
			})
		})
		.then(function(deployed){
			return randInst.getBlockTimestamp().then(function(rpcresult){
					// console.log("manInst.checkManager.callback=="+rpcresult);
					return rpcresult.getResult().then(function(ret){
						console.log("randInst.getBlockTimestamp.rpcresult=="+ret.toHexString());
					}) 
			})
		})

		return p1;


	})


	


})





