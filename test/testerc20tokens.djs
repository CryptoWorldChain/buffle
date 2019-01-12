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
			console.log("获取token总量")
			return manInst.getTokenTotalSupply().then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("获取token总量.即诶过=="+ret.toHexString());
					return ret.toHexString();
				})
			});
		}).then(function(lastret){
			console.log("获取账户的token数量："+accounts[0])
			return manInst.getTokenBalance(accounts[0],{from:accounts[3]}).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("获取账户【"+accounts[0]+"】的token数量.结果=="+ret.toHexString());
					return ret.toHexString();
				})
			});
		})
		.then(function(balanceof){
			console.log("往合约里面充币")
			return manInst.depositToken(100000,{from:accounts[0]}).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("往合约里面充币.结果=="+ret.toHexString());
					return ret.toHexString();
				})
			});
		})
		.then(function(lastret){
			console.log("检查合约币总数")
			return manInst.getTokenBalance("0x"+manInst.address).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("合约币总数.结果=="+ret.toHexString());
					return ret.toHexString();
				})
			});
		})
		.then(function(lastret){
			console.log("从合约里面提币");
			return manInst.withdrawToken(100,{from:accounts[0]}).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("从合约里面提币.结果=="+ret.toHexString());
					return ret.toHexString();
				})
			});
		})
		.then(function(lastret){
			console.log("以合约管理员从合约往外打币");
			return manInst.transOutToken(accounts[2],10,{from:accounts[0]}).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("以合约管理员从合约往外打币.结果=="+ret.toHexString());
					return ret.toHexString();
				})
			});
		})
	  .then(function(lastret){
			console.log("检查地址币总数")
			return manInst.getTokenBalance(accounts[2]).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("检查地址"+accounts[2]+"币总数.结果=="+ret.toHexString());
					return ret.toHexString();
				})
			});
		})
		.then(function(lastret){
			console.log("以非法账户从合约往外打币--应该失败的:"+accounts[5]);
			return manInst.transOutToken(accounts[5],10,{from:accounts[3]}).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("从合约往外打币--应该失败的.结果=="+ret.toHexString());
					return ret.toHexString();
				})
			});
		})
		.then(function(lastret){
			console.log("检查地址币总数:"+accounts[5])
			return manInst.getTokenBalance(accounts[5]).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("检查地址币总数"+accounts[5]+".结果=="+ret.toHexString());
					return ret.toHexString();
				})
			});
		})

		
		return p1;


	})


	


})





