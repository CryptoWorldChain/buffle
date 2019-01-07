var sleep = require('sleep')

var CWVRandImpl = artifacts.require("CWVRandImpl");
var CWVToken = artifacts.require("CWVToken");

console.log("CWVToken=="+CWVToken);
console.log("deployer == "+deployer);
deployer.deploy(CWVRandImpl).then(function(address){
	console.log("get deployed .111 address=="+address);

})

deployer.deploy(CWVToken).then(function(address){
	console.log("get CWVToken deploy address=="+address);

})

contract('#testall', function(accounts) {

	console.log("test my boy:accounts=="+accounts+",cwv="+JSON.stringify(cwv))
	// console.log("it=="+it);
	it('test.1-getbalance', async function(accounts) {

		console.log("accounts.getbalance="+accounts[0])  

		var p = cwv.checkAndSetNonce(accounts[0]).then(function(body){
			console.log("get body:"+body);

		}).catch(function (error){
			console.log("get error:"+error);
		});
		await p;

		p = cwv.transfer(accounts[3],100).then(function(body){
			console.log("get body:"+body);
		}).catch(function (error){
			console.log("get error:"+error);
		}).done();
		await p;
		
		sleep.sleep(5);
		// p = cwv.transfer(accounts[4],100,{from:accounts[1]}).then(function(body){
		// 	console.log("get body:"+body);
		// }).catch(function (error){
		// 	console.log("get error:"+error);
		// }).done();
		// await p;

		p = cwv.getBalance(accounts[3],{from:accounts[1]}).then(function(body){
			console.log("get body:"+body);
		}).catch(function (error){
			console.log("get error:"+error);
		}).done();
		await p;

		console.log("okok:");
		return p;
	});

});






