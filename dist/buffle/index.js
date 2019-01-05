'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _run = require('./run');

var _run2 = _interopRequireDefault(_run);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _contractbuild = require('./contractbuild');

var _contractbuild2 = _interopRequireDefault(_contractbuild);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var VERSION = "v1.0.0";

// console.log("version:F17::"+VERSION+",cwv="+cwv) 
_contractbuild2.default.compile();

exports.default = {
	version: VERSION,
	runner: _run2.default,
	build: _contractbuild2.default.compile
};