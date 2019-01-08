
import fs from 'fs';

import path from 'path';
import Buffle from "./global";
import utils from "./utils";
import {KeyPair,keystore} from "@cwv/cwv.js";

import config from 'config'


var getFileName=function(ksDir,prefix){
	var i=0;
	while(i<10000000){
		var tryfile = path.join(ksDir,prefix+i+".json");
		if(!fs.existsSync(tryfile)){
			return tryfile;
		}
		i++;
	}
	return NaN;
	
}

var __saveKeyStore = function(kp){
	var ksDir = utils.checkDir('keystore');
	var ksJson = keystore.exportJSON(kp,kp.keystore_pwd||config.keystore.passwd||"000000");
	var file=kp.keystore_filename;
	if(file){
		// console.log("saveKeyStore:"+file+"==>"+ksJson);
		let fd = fs.openSync(file, 'w+');
		fs.writeSync(fd,JSON.stringify(ksJson));
	}else{
		console.error("cannot store file in "+kp.keystore_filename);
	}
}

var _ensureAccounts = function(num){
	var ksDir = utils.checkDir('keystore');
	console.log("ksDir=="+ksDir); 
	if(ksDir){
		var existAccounts=[];
		try{
			var kpcount = 0;
			fs.readdirSync(ksDir).filter(function(file) {
			    return file.substr(-5) === '.json';
			}).forEach( function(file) {
				try{
					kpcount ++;
					var ksContent = require(path.join(ksDir,file));
					// console.log("get key store:"+JSON.stringify(ksContent));
					var kp=keystore.json2KeyPair(ksContent,config.keystore.passwd||"000000");
					kp.keystore_filename = path.join(ksDir,file);
					console.log("load account ok,address=0x"+kp.hexAddress+',nonce='+kp.nonce);
					existAccounts.push(kp);
				}catch(err){
					console.error("load key store file error:",err);
				}
			});
			if(kpcount<num){
				var cwv = Buffle.cwv
				console.log('need to gen keystore:'+num+",cwv="+JSON.stringify(Buffle.cwv));
				for(var i=0;i<num-kpcount;i++){
					var kp = KeyPair.genRandomKey();
					existAccounts.push(kp);
					var ksJson = keystore.exportJSON(kp,config.keystore.passwd||"000000");
					var file=getFileName(ksDir,config.keystore.prefix||"keystore-");
					if(file){
						// console.log("new keystore:"+file+"==>"+ksJson);
						kp.keystore_filename = file;
						let fd = fs.openSync(file, 'w+');
						fs.writeSync(fd,JSON.stringify(ksJson));
					}else{
						console.error("cannot create file in "+ksDir);
					}
					
				}

			}else{
				console.log('get enough accounts:'+existAccounts.length);
			}
			// var accounts = [];
			Buffle.accounts = [];
			Buffle.keypairs = {};
			// console.log("Buffle.accounts="+Buffle.addAccounts);
			for(var i=0;i<existAccounts.length;i++){
				var kp=existAccounts[i];
				Buffle.accounts.push("0x"+kp.hexAddress);
				Buffle.keypairs["0x"+kp.hexAddress] = kp;	

				// Buffle.addAccounts(kp);
				//Buffle.keypairs["0x"+kp.hexAddress] = kp;
			}
			 

		}catch(err){
			console.error("error in gen account:",err)
		}
	}else{
		console.log("keystore director not found!")
	}
}


export default {
	ensureAccounts:_ensureAccounts,
	saveKeyStore:__saveKeyStore,
}

module.exports.saveKeyStore = __saveKeyStore
