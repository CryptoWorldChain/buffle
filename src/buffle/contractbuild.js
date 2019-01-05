import  fs from 'fs-extra'
import  path from 'path';
import solc  from "solc";

import contractMock from "./contractMock"


var compiled_contracts = {};

var compile = ()=>{
	// console.log("compiling contracts");
	var solDir = path.join(__dirname,'..', 'contracts');
	var outputdir = path.join(__dirname,'..', 'build','contracts');
	console.log("compiling contracts outputdir=="+outputdir)
	try{
			fs.ensureDir(outputdir);
	}catch(err){
			console.log("mkdir error=="+err);
		}
	fs.readdirSync(solDir).filter(function(file) {
	    return file.substr(-4) === '.sol';
	}).forEach( function(file) {
		// console.log("try to compile:"+file);
		var sourcecode = fs.readFileSync(path.join(solDir, file),"UTF-8");
		// console.log("compile:"+file+",source="+sourcecode+",solc="+solc);
		try{
			var input = {
			    language: 'Solidity',
			    sources: {},
			    settings: {
			        outputSelection: {
			            '*': {
			                '*': [ '*' ]
			            }
			        }
			    }
			}
			input.sources[""+file] = {content: ""+sourcecode};
			var output = solc.compileStandardWrapper(JSON.stringify(input));
			// console.log("get out=="+output);
			var outjson=JSON.parse(output);
			for (var contractName in outjson.contracts[file]) {
			    // code and ABI that are needed by web3
			    // console.log(contractName + ': ' + output.contracts[contractName].bytecode)
			    var outputfile = path.join(outputdir,contractName+".json");
			    
			    compiled_contracts[contractName] = outjson.contracts[file][contractName];

			    var outputcontent = JSON.stringify(outjson.contracts[file][contractName]);
			    console.log("solc:"+file+"::"+contractName + '==> ' + outputfile+",size="+outputcontent.length);

			    fs.writeFileSync(outputfile,outputcontent,{flag:'w+'});
			}
		}catch(err){
			console.log("sol compile error=="+err);
		}
	});
}

var require = function(contractName){
	return new contractMock.Contract(compiled_contracts[contractName]);
}


export default {
	compile:compile,
	require:require
}

module.exports.require = require
module.exports.compile = compile
