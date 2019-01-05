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

var _contractbuild = require('./contractbuild');

var _contractbuild2 = _interopRequireDefault(_contractbuild);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Instantiate a Mocha instance.
// var mocha = new Mocha();
_contractbuild2.default.compile();

var mocha = new _mocha2.default();

mocha.addFile(_path2.default.join(__dirname, 'mocha_preload.js'));
console.log("==============run mocha=================:" + new Date());
// // Run the tests.

mocha.run(function (failures) {
  console.log("--------mocha--end-----------:" + new Date());
  console.log("failures==" + failures);
});

exports.default = {
  testdir: "__dirname",
  mocha: mocha

};