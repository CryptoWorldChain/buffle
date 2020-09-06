var swap = artifacts.require("CWVSwap");

contract('#testall', function(accounts) {
    console.log("test my boy:accounts=="+accounts+",cwv="+JSON.stringify(cwv))
    it('test.1-getsetnoncebalance', async function(accounts) {
        console.log("accounts[0]="+accounts[0])
        var p = cwv.checkAndSetNonce(accounts[0]).then(function(body){
            console.log("get body:"+JSON.stringify(body));
            return cwv.checkAndSetNonce(accounts[1]);
        }).catch(function (error){
            console.log("get error:"+error);
        });
        await p;

        var manInst = NaN;
        // console.log("swap======"+JSON.stringify(swap))
        p = deployer.deploy(swap,[
            "0x".concat(Buffer.from('AAA').toString("hex").concat('20').padStart(40,'0')),
            "0x".concat(Buffer.from('BBB').toString("hex").concat('20').padStart(40,'0')),
            ["0x59514f8d87c964520fcaf515d300e3f704bf6fcb"]]).then(function(inst){
            console.log("get swap deploying inst.address=="+inst.address+",txhash = "+inst.hash);    
            return inst;
        }).then(function(inst){
            manInst=inst;
            // return manInst.poolBalance0
            return manInst.initPool("100000000000000000000","200000000000000000000")
        }).then(function(result){
            // manInst.poolBalance0().then(function(rpcresult){
            //     return rpcresult.getResult().then(function(ret){
			// 		console.log("manInst.poolBalance0.rpcresult=="+ret.toHexString());
			// 	})
            // })
        });
    })
})