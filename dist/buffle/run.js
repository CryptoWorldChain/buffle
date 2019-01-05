'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Instantiate a Mocha instance.
// var mocha = new Mocha();


var _buildAndRun = function _buildAndRun() {
	console.log(" ============== compiling ================= ");
	var Mocha = require('mocha');
	var contractbuild = require('./contractbuild.js');
	contractbuild.compile();
	var mocha = new Mocha();
	mocha.addFile(_path2.default.join(__dirname, 'mocha_preload.js'));
	console.log(" --------------run test------------------ ");
	// // Run the tests.

	mocha.run(function (failures) {
		console.log(" -----------------test end----------- ");
		console.log("failures==" + failures);
	});
};

exports.default = {
	testdir: "__dirname",
	buildAndRun: _buildAndRun
};