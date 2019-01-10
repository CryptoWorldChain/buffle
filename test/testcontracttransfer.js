var sleep = require('sleep')


var TokenStore = artifacts.require("TokenStore");


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
		
		var manInst = NaN;
		var p = deployer.deploy(TokenStore,[accounts[0]],{from:accounts[0]}).then(function(inst){
			console.log("get TokenStore deploying inst.address=="+inst.address+",txhash = "+inst.txhash);
			manInst=inst;

			return inst;
		});

		await p;

		console.log("get ManagerInst="+manInst.address);

		var p1=manInst.deployed().then(function(inst){
			console.log("deployed inst.address=="+inst.address+",txhash = "+inst.txhash);
			//transfer to contract
			manInst = inst;
			return cwv.transfer(inst.address,133);
		}).then(function(transResult){
			console.log(" transfer ret:"+transResult.constructor.name);
			return transResult.done();
		}).catch(function (error){
			console.log("transfer error:"+error,error);
		}).then(function(deployed){
			manInst.getBalance().then(function(rpcresult){
					// console.log("manInst.checkManager.callback=="+rpcresult);
					return rpcresult.getResult().then(function(ret){
						console.log("manInst.getBalance.rpcresult=="+ret.toHexString());
					}) 
			}).then(function (balance){
				console.log("transout:"+accounts[3]+",balance="+balance);
				return manInst.transOut(accounts[3],310).then(function(rpcresult){
					return rpcresult.getResult().then(function(ret){
						console.log("manInst.transOut.rpcresult=="+ret.toHexString());
						return ret.toHexString();
					}) 
				})
			}).then(function(result){
				console.log("get balance:");
				return cwv.getBalance(accounts[3]).then(function(body){
					console.log("get balance body:"+body);
				}).catch(function (error){
					console.log("get error:"+error);
				})
			})
		})
		return p1;


	})


	


})





