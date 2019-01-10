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

		p=manInst.deployed().then(function(inst){
			console.log("deployed inst.address=="+inst.address+",txhash = "+inst.txhash);
			manInst.mancount().then(function(rpcresult){
					// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("manInst.mancount.rpcresult=="+ret.toHexString());
				})
			})
			manInst.testmapp2(accounts[0],accounts[0]).then(function(rpcresult){
					// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("manInst.testmapp2.rpcresult=="+ret.toHexString());
				})
			})
			manInst.testmapp3(accounts[0],accounts[0],accounts[0]).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("manInst.testmapp2.rpcresult=="+ret.toHexString());
				})
			})
			manInst.managers(accounts[0]).then(function(rpcresult){
				// console.log("manInst.mancount.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("manInst.managers.rpcresult=="+ret);
				})
			})
			.then(function(ret){
			return	manInst.addManager(accounts[1],{from:accounts[1]}).then(function(rpcresult){
					// console.log("manInst.checkManager.callback=="+rpcresult);
					return rpcresult.getResult().then(function(ret){
						console.log("manInst.addManager.rpcresult=="+ret.toHexString());
					}) 
				})}).then(function(ret){
					return manInst.generateLockId({from:accounts[1]}).then(function(rpcresult){
						// console.log("manInst.generateLockId.callback=="+rpcresult);
						return rpcresult.getResult().then(function(ret){
							console.log("manInst.generateLockId.rpcresult=="+ret.toHexString());
							})
						})
				}).then(function (r){
					manInst.managers(accounts[1]).then(function(rpcresult){
						// console.log("manInst.mancount.2.callback=="+rpcresult);
						return rpcresult.getResult().then(function(ret){
							console.log("manInst.mancount.rpcresult=="+ret.toHexString());
						})
					})
					manInst.testmapp2(accounts[1],accounts[1]).then(function(rpcresult){
						// console.log("manInst.mancount.2.callback=="+rpcresult);
						return rpcresult.getResult().then(function(ret){
							console.log("manInst.testmapp2.rpcresult=="+ret.toHexString());
						})
					})
					manInst.testmapp3(accounts[1],accounts[1],accounts[1]).then(function(rpcresult){
						// console.log("manInst.mancount.2.callback=="+rpcresult);
						return rpcresult.getResult().then(function(ret){
							console.log("manInst.testmapp2.rpcresult=="+ret.toHexString());
						})
					})
				}).then(function(rpcresult){
					console.log("=====>> requestChange")
					return manInst.requestChange(accounts[3],"0x0",{from:accounts[0]});
				}).then(function (rpcresult){
					console.log("==>requestChange.rpcresult=="+rpcresult);
					return rpcresult.getResult();
				}).then(function(rpcresult){
					console.log("==>request instid=="+rpcresult.toHexString())
					return manInst.changeReqs(rpcresult.toHexString()).then(function(rpcresult){
						// console.log("manInst.mancount.2.callback=="+rpcresult);
						return rpcresult.getResult().then(function(ret){
							console.log("===>request instid.result=="+JSON.stringify(ret.resultObj));
						})
					})
				})

			
			
		})

		return p;

		
		


	})


	


})





