'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _mocha = require('mocha');

var _mocha2 = _interopRequireDefault(_mocha);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mochaParams = require('mocha-params');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mocha = new _mocha2.default();
// Instantiate a Mocha instance.
// var mocha = new Mocha();

mocha.addFile(_path2.default.join(__dirname, 'mocha_preload.js'));
console.log("==============run mocha=================:" + new Date());
// // Run the tests.

mocha.run(function (failures) {
	console.log("--------mocha--end-----------:" + new Date());
});

exports.default = {
	testdir: "__dirname",
	mocha: mocha

};