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

	})


	it('test.2-deploy contract', async function(accounts) {
		var manInst = NaN;
		var p = deployer.deploy(ManagerUpgradeable,{from:accounts[0]}).then(function(inst){
			console.log("get ManagerUpgradeable deploy inst.address=="+inst.address+",txhash = "+inst.txhash);
			manInst=inst;
		});

		await p;

		console.log("get ManagerInst="+manInst.address);

		manInst

	})


})




