var sleep = require('sleep')


var Token21Store = artifacts.require("Token21Store");


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
		var p = deployer.deploy(Token21Store,[accounts[0]],{from:accounts[0]}).then(function(inst){
			console.log("get Token21Store deploying inst.address=="+inst.address+",txhash = "+inst.txhash);
			manInst=inst;

			return inst;
		});

		await p;

		var tokenid = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb4cccccccccdddddddddeffffff0000aaa00bb00bb0b000000333333333333333333';

		console.log("get ManagerInst="+manInst.address);

		var p1=manInst.deployed().then(function(inst){
			console.log("deployed inst.address=="+inst.address+",txhash = "+inst.txhash);
			//transfer to contract
			manInst = inst;
			return manInst;
		}).then(function(inst){
			console.log("获取合约的token总量")
			return manInst.getAllBalance().then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("获取token总量.结果=="+ret.toHexString());
					return ret.toHexString();
				})
			});
		})
		.then(function(lastret){
			console.log("获取账户的token数量："+accounts[0])
			return manInst.getBalanceOf(accounts[0],{from:accounts[3]}).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("获取账户【"+accounts[0]+"】的token数量.结果=="+ret.toHexString());
					return ret.toHexString();
				})
			});
		})
		.then(function(lastret){
			console.log("ownerOf")
			return manInst.ownerOf(0,{from:accounts[3]}).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("ownerOf.结果=="+ret.toHexString());
					return ret.toHexString();
				})
			});
		})	
		.then(function(lastret){
			console.log("获取token总量")
			return manInst.totalSupply({from:accounts[3]}).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("获取token数量.结果=="+ret.toHexString());
					return ret.toHexString();
				})
			});
		})		
		.then(function(lastret){
			console.log("获取tokenid 根据id:"+0)
			return manInst.tokenByIndex(0,{from:accounts[3]}).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("获取tokenid 根据id[0].结果=="+ret.toHexString());
					tokenid = '0x'+ret.toHexString();
					return ret.toHexString();
				})
			});
		})
		
		.then(function(lastret){
			console.log("获取tokenid 根据账户和id："+accounts[0])
			return manInst.tokenOfOwnerByIndex(accounts[0],0,{from:accounts[3]}).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("获取tokenid 根据账户和id0："+accounts[0]+".结果=="+ret.toHexString());
					return ret.toHexString();
				})
			});
		})
		
		.then(function(balanceof){
			console.log("往合约里面充币,withdata")
			return manInst.depositTokenWithData(tokenid,'0x001',{from:accounts[0]}).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("往合约里面充币.结果=="+ret.toHexString());
					return ret.toHexString();
				})
			});
		})
		.then(function(lastret){
			console.log("从合约币提币")
			return manInst.withdrawToken(tokenid,'0x002',{from:accounts[0]}).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("从合约币提币"+ret.toHexString());
					return ret.toHexString();
				})
			});
		})
		.then(function(balanceof){
			console.log("往合约里面充币")
			return manInst.depositToken(tokenid,{from:accounts[0]}).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("往合约里面充币.结果=="+ret.toHexString());
					return ret.toHexString();
				})
			});
		})
		.then(function(lastret){
			console.log("以合约管理员从合约往外打币");
			return manInst.transOutToken(accounts[0],tokenid,'0x003',{from:accounts[0]}).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("以合约管理员从合约往外打币.结果=="+ret.toHexString());
					return ret.toHexString();
				})
			});
		})
	  	.then(function(lastret){
			console.log("以非法账户从合约往外打币--应该失败的:"+accounts[5]);
			return manInst.transOutToken(accounts[5],tokenid,'0x004',{from:accounts[3]}).then(function(rpcresult){
				// console.log("manInst.mancount.2.callback=="+rpcresult);
				return rpcresult.getResult().then(function(ret){
					console.log("从合约往外打币--应该失败的.结果=="+ret.toHexString());
					return ret.toHexString();
				})
			});
		})
		.then(function(lastret){
			console.log("检查地址币总数:"+accounts[5])
			return manInst.getBalanceOf(accounts[5]).then(function(rpcresult){
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





