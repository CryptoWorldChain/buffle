import  fs from 'fs-extra'
import  path from 'path';
import solc  from "solc";
import contractMock from "./contractMock"
var compiled_contracts = {};
var compile = ()=>{
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
		var sourcecode = fs.readFileSync(path.join(solDir, file),"UTF-8");
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
			var outjson=JSON.parse(output);
			for (var contractName in outjson.contracts[file]) {
			    var outputfile = path.join(outputdir,contractName+".json");			    
			    compiled_contracts[contractName] = outjson.contracts[file][contractName];
			    var outputcontent = JSON.stringify(outjson.contracts[file][contractName]);
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
