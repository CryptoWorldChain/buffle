"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.deploy = deploy;

var _global = require("./global");

var _global2 = _interopRequireDefault(_global);

var _contractMock = require("./contractMock");

var _contractMock2 = _interopRequireDefault(_contractMock);

var _sleep = require("sleep");

var _sleep2 = _interopRequireDefault(_sleep);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

async function deploy(contract) {

	console.log("contract to deploy==" + contract);
	if (contract) {
		return contract.doDeploy(_global2.default.cwv);
	}
}