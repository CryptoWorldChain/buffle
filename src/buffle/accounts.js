
import fs from 'fs';

import path from 'path';
import Buffle from "./global";
import utils from "./utils";

import config from 'config'

var genAccounts = function(num){

}

var _ensureAccounts = function(num){
	var ksDir = utils.checkDir('keystore');
	console.log("ksDir=="+ksDir); 
	if(ksDir){
		var existAccounts=[];
		try{
			fs.readdirSync(ksDir).filter(function(file) {
			    return file.substr(-5) === '.json';
			}).forEach( function(file) {
				var ksContent = require(path.join(ksDir,file));
				console.log("get key store:"+ksContent);
			});
			
			if(existAccounts.length<num){
				console.log('need to gen keystore:'+num);
				const bundle = require('@cwv/cwv.js');//path.join(__dirname,"../", 'dist', 'cwvbuffle.js'));
				Buffle.cwv=bundle.cwv;
				console.log("cwv=="+Buffle.cwv);

			}else{
				console.log('get enough accounts:'+existAccounts.length);
			}
		}catch(err){
			console.error("error in gen account:",err)
		}
	}else{
		console.log("keystore director not found!")
	}
}


export default {
	ensureAccounts:_ensureAccounts
}