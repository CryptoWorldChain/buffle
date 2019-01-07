

/**
	shared variable
*/

import cwv from "@cwv/cwv.js";


function Buffle(){
	console.log("Buffle.cwv="+cwv)
	this.cwv = cwv;
	this.accounts = [];
	this.keypairs = {};
	this.rpc_provider = NaN;
}

module.exports = Buffle;
