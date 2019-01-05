'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _solc = require('solc');

var _solc2 = _interopRequireDefault(_solc);

var _contractMock = require('./contractMock');

var _contractMock2 = _interopRequireDefault(_contractMock);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var compiled_contracts = {};

var compile = function compile() {
	// console.log("compiling contracts");
	var solDir = _path2.default.join(__dirname, '..', 'contracts');
	var outputdir = _path2.default.join(__dirname, '..', 'build', 'contracts');
	console.log("compiling contracts outputdir==" + outputdir);
	try {
		_fsExtra2.default.ensureDir(outputdir);
	} catch (err) {
		console.log("mkdir error==" + err);
	}
	_fsExtra2.default.readdirSync(solDir).filter(function (file) {
		return file.substr(-4) === '.sol';
	}).forEach(function (file) {
		// console.log("try to compile:"+file);
		var sourcecode = _fsExtra2.default.readFileSync(_path2.default.join(solDir, file), "UTF-8");
		// console.log("compile:"+file+",source="+sourcecode+",solc="+solc);
		try {
			var input = {
				language: 'Solidity',
				sources: {},
				settings: {
					outputSelection: {
						'*': {
							'*': ['*']
						}
					}
				}
			};
			input.sources["" + file] = { content: "" + sourcecode };
			var output = _solc2.default.compileStandardWrapper(JSON.stringify(input));
			// console.log("get out=="+output);
			var outjson = JSON.parse(output);
			for (var contractName in outjson.contracts[file]) {
				// code and ABI that are needed by web3
				// console.log(contractName + ': ' + output.contracts[contractName].bytecode)
				var outputfile = _path2.default.join(outputdir, contractName + ".json");

				compiled_contracts[contractName] = outjson.contracts[file][contractName];

				var outputcontent = JSON.stringify(outjson.contracts[file][contractName]);
				console.log("solc:" + file + "::" + contractName + '==> ' + outputfile + ",size=" + outputcontent.length);

				_fsExtra2.default.writeFileSync(outputfile, outputcontent, { flag: 'w+' });
			}
		} catch (err) {
			console.log("sol compile error==" + err);
		}
	});
};

var _require = function _require(contractName) {
	return new _contractMock2.default.Contract(compiled_contracts[contractName]);
};

exports.default = {
	compile: compile,
	require: _require
};


module.exports.require = _require;
module.exports.compile = compile;