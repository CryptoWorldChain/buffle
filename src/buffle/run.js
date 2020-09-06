import path from 'path';
import Buffle from "./global";
import config from 'config'
import accounts from "./accounts";

import cwv from "@cwv/cwv.js";
var _buildAndRun = function(){
	Buffle.cwv=cwv;
	accounts.ensureAccounts(config.accounts.num);
	
	var  Mocha =require('mocha')
	if(config.network.rpc){
		console.log("change serverbase.serveraddr.rpc="+config.network.rpc);
		global.server_base = config.network.rpc
	}
	var contractbuild = require( './contractbuild.js')
	contractbuild.compile();
	var mocha=new Mocha();
	mocha.addFile( path.join(__dirname,'mocha_preload.js' ));
	console.log(" ------run test------------------ ")
	
	mocha.run(function(failures) {
		console.log(" --------test end--------- failures=="+failures)
	});
};

export default {
	testdir:"__dirname",
	buildAndRun:_buildAndRun
}

