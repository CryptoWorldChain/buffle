
import  fs from 'fs'
import  path from 'path';
// Instantiate a Mocha instance.
// process.env["NODE_CONFIG_DIR"] = __dirname + "/configDir/";

import config from 'config'
import accounts from "./accounts";

// var mocha = new Mocha();

// console.log("serveraddr="+JSON.stringify(config));

var _buildAndRun = function(){

		accounts.ensureAccounts(config.accounts.num);
	
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

