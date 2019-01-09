
import  fs from 'fs'
import  path from 'path';
// Instantiate a Mocha instance.
// process.env["NODE_CONFIG_DIR"] = __dirname + "/configDir/";
import Buffle from "./global";
import config from 'config'
import accounts from "./accounts";

import abi from 'ethereumjs-abi';



// import cwvmockup from './cwvmockup'
// var mocha = new Mocha();

// console.log("serveraddr="+JSON.stringify(config));
import cwv from "@cwv/cwv.js";
var _buildAndRun = function(){
		Buffle.cwv=cwv;
		accounts.ensureAccounts(config.accounts.num);

		// console.log("mockup=="+cwvmockup.transfer);
		// var args=["mancount():(uint256)"];
		// var decoded = abi.rawDecode(["uint256"], 
		// 	Buffer.from("0000000000000000000000000000000000000000000000000000000000000001",'hex'))
		// console.log("decoded=="+decoded)
		var decoded = abi.rawDecode(["bytes32"], 
			Buffer.from("06761d9658b32d8e19bc9ba223cfb66f6f1368e142c526e1ee0e5f428fc593c7",'hex'))
		console.log("decode.len="+decoded.length);
		console.log("decoded=="+ new Buffer(decoded[0]).toString('hex'))



		// var bb=abi.methodID("getManCount",[]);

		// console.log("bb="+bb.toString('hex'));
		
		var  Mocha =require('mocha')
		// console.log("serveraddr.rpc="+config.network.rpc);
		if(config.network.rpc){
			console.log("change serverbase.serveraddr.rpc="+config.network.rpc);
			global.server_base = config.network.rpc
		}
		var contractbuild = require( './contractbuild.js')
		contractbuild.compile();
		var mocha=new Mocha();
		mocha.addFile( path.join(__dirname,'mocha_preload.js' ));
		console.log(" ------run test------------------ ")
		// // Run the tests.

		mocha.run(function(failures) {
		   console.log(" --------test end--------- failures=="+failures)
		});
	};


export default {
	testdir:"__dirname",
	buildAndRun:_buildAndRun
}

