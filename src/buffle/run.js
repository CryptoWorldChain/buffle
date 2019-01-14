
import  fs from 'fs'
import  path from 'path';
// Instantiate a Mocha instance.
// process.env["NODE_CONFIG_DIR"] = __dirname + "/configDir/";
import Buffle from "./global";
import config from 'config'
import accounts from "./accounts";

import abi from 'ethereumjs-abi';
import Keccak  from "sha3";



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
		// var decoded = abi.rawDecode(["uint256"], 
			// Buffer.from("6222021fddf16184ed77c27acd7a9ca8d0922f8f84506d95a4d4ee6c964b6360",'hex'))
		// console.log("decode.len="+decoded.length+",i="+decoded[0].toString('hex'));
		// console.log("decoded=="+ new Buffer(decoded[0]).toString('hex'))
		// var key = "00000000000000000000000069ee6d7cc0be11ceb79ed7679144543e62a095440000000000000000000000000000000000000000000000000000000000000001";
		// console.log("requestkey=="+key);
		// var hash=new Keccak(256);
		// hash.update(Buffer.from(key,'hex'));

		// var keyhex=new Buffer(hash.digest()).toString('hex');
		// console.log("keyhex="+keyhex);




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

