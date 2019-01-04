

contract('#testall', function(accouts) {

	console.log("test my boy:accouts=="+accouts+",cwv="+cwv)
	// console.log("it=="+it);
	it('test.1-getbalance', async function(accounts) {
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






