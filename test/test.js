

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

contract('#testall', function(accouts) {

	console.log("test my boy:accouts=="+accouts+",cwv="+cwv)
	// console.log("it=="+it);
	it('test.1-getbalance', async function(accounts) {

		CWVRandImpl.deployed().then(function(inst){
			console.log("get deployed.2222 inst=="+inst.address);
			try{
				inst.getBlockNum(1,2,3,"agbc");
			}catch(error){
				console.log("get error:"+error);
			}
		})

		CWVToken.deployed().then(function(inst){
			console.log("get CWVToken. inst=="+inst.address);
			inst.totalSupply.call();
		})


		console.log("accounts.getbalance="+accounts[0]+",cwv="+cwv) 
		var p = cwv.rpc.getBalance("df2fc3cdc723c8f5be2f51b5d051ace6264008ad").then(function(body){
			console.log("get body:"+JSON.stringify(body));
		}).catch(function (error){
			console.log("get error:"+error);
		}).done();
		await p;
		console.log("okok:");
		return p;
	});

});






