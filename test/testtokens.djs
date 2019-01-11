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
			return manInst;
		}).then(function(inst){
			return manInst.getTokenTotalSupply().then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("manInst.getTokenTotalSupply.rpcresult=="+ret.toHexString());
				})
			});
		}).catch(function (error){
			console.log("tokensupply error:"+error,error);
		}).then(function(tokensupply){
			console.log("tokensupply="+tokensupply)
			return manInst.getTokenBalance(accounts[0],{from:accounts[3]}).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("manInst.balanceOf.rpcresult=="+ret.toHexString());
				})
			});
		})
		.then(function(balanceof){
			console.log("balanceOf="+balanceof)
			return manInst.tokenTransfer(accounts[1],100,{from:accounts[2]}).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("manInst.tokenTransfer.rpcresult=="+ret.toHexString());
				})
			});
		})
		.then(function(balanceof){
			console.log("balanceOf="+balanceof)
			return manInst.tokenContractTransfer(accounts[5],500,{from:accounts[4]}).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("manInst.tokenTransfer.rpcresult=="+ret.toHexString());
				})
			});
		})

		
		return p1;


	})


	


})





