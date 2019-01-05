"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var RpcMethod = function () {
	function RpcMethod(contractinst, name) {
		_classCallCheck(this, RpcMethod);

		this.contractinst = contractinst;
		this.method_name = name;
		// console.log("new abi method ="+this.method_name+",inst="+contractinst)
	}

	_createClass(RpcMethod, [{
		key: "call",
		value: function call() {
			//在这里调用远程的方法方案
			console.log("calling method==" + this.method_name + ",contractaddr=" + this.contractinst.address);
			for (var arg in arguments) {
				console.log("arg==" + arg);
			}
		}
	}]);

	return RpcMethod;
}();

var RpcCall = function RpcCall() {
	if (!this.name) {
		this.name = NaN;
	}
	console.log("calling method==" + this.name + ",args=" + arguments);
};

var ContractInstance = function ContractInstance(contract, address) {
	_classCallCheck(this, ContractInstance);

	// code

	this.contract = contract;
	this.address = address;
	for (var abi in contract.abi) {
		var abidesc = contract.abi[abi];
		if (abidesc.name && abidesc.type == 'function') {
			console.log("get abi==>" + abidesc.name + ",json=" + JSON.stringify(abidesc));
			var rpcM = new RpcMethod(this, abidesc.name);
			var unbound = rpcM.call;
			this[abidesc.name] = unbound.bind(rpcM);
			this[abidesc.name].call = this[abidesc.name];
		}
	}
};

var Contract = function () {
	function Contract(opts) {
		_classCallCheck(this, Contract);

		// code
		this.opts = opts;
	}

	_createClass(Contract, [{
		key: "doDeploy",
		value: function doDeploy(cwv) {
			var _this = this;

			this.deployPromise = new Promise(function (resolve, reject) {
				//TODO !在哪里发布合约到链上
				resolve(new ContractInstance(_this.opts, "0xdf2fc3cdc723c8f5be2f51b5d051ace6264008ad"));
			});
			return this.deployPromise;
		}

		// methods

	}, {
		key: "deployed",
		value: function deployed() {
			return this.deployPromise;
		}
	}]);

	return Contract;
}();

exports.default = {
	Contract: Contract,
	ContractInstance: ContractInstance
};