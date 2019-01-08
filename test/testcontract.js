var sleep = require('sleep')


var ManagerUpgradeable = artifacts.require("ManagerUpgradeable");


contract('#testall', function(accounts) {

	console.log("test my boy:accounts=="+accounts+",cwv="+JSON.stringify(cwv))
	// console.log("it=="+it);
	it('test.1-getsetnoncebalance', async function(accounts) {

		var p = cwv.checkAndSetNonce(accounts[0]).then(function(body){
			console.log("get body:"+body);

		}).catch(function (error){
			console.log("get error:"+error);
		});
		await p;
		// sleep.sleep(10);

		var manInst = NaN;
		var p = deployer.deploy(ManagerUpgradeable,[accounts[0]],{from:accounts[0]}).then(function(inst){
			console.log("get ManagerUpgradeable deploying inst.address=="+inst.address+",txhash = "+inst.txhash);
			manInst=inst;
			return inst;
		});

		await p;

		console.log("get ManagerInst="+manInst.address);

		manInst.deployed().then(function(inst){
			console.log("deployed inst.address=="+inst.address+",txhash = "+inst.txhash);
			manInst.getManCount().then(function(ret){
				console.log("manInst.mancount.callback=="+ret);
			})
		})



	})


	


})





