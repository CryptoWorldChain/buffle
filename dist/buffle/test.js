'use strict';

var path = require('path');
var JSDOM = require('mocha-jsdom');
var sleep = require('sleep');
var assert = require('assert');
var sinon = require('sinon');
var Test = require('mocha/lib/test');

var rp = require('request-promise');

var dom = new JSDOM({
	url: "http://localhost/"
});

var using = require('mocha-params'); // javascript


var cwv;

console.log("whoami.1=" + undefined.constructor.name);

describe('#testall', function () {

	console.log("whoami.2=" + this.constructor.name);
	// console.log("hello::.1 .:suit=="+suites); 
	beforeEach(function () {
		httpPostStub = sinon.stub(rp, 'post'); // stub http so we can change the response
	});

	afterEach(function () {
		httpPostStub.restore();
	});
	//console.log("suit=="+Suite);


	var thissuite = this;
	var thisfile = this.file;

	var preloadaccts = ["a", "b", "c"];

	var bit = function bit(title, fn) {
		var suite = thissuite;
		if (suite.isPending()) {
			fn = null;
		}
		var test = new Test(title, function wrapping() {
			fn(preloadaccts);
		});
		test.file = thisfile;
		suite.addTest(test);
		return test;
	};

	// 


	bit('load bundle', function (accounts) {
		console.log("accounts=" + accounts);
		// import cwv from 'cwv.js';
		var bundle = require('@cwv/cwv.js'); //path.join(__dirname,"../", 'dist', 'cwvbuffle.js'));
		console.log("cwv version=" + bundle.cwv["version"]);
		cwv = bundle.cwv;
		cwv.rpc.setMockRequest(rp);
		return true;
	});
	bit('test', function (accounts) {
		console.log("testsuit...bit.accounts.leng=" + accounts.length);
	});

	// it('test.1-getbalance', async function(accounts) {
	// 	console.log("accounts.getbalance="+accounts[0])
	// 	var p = cwv.rpc.getBalance("df2fc3cdc723c8f5be2f51b5d051ace6264008ad").then(function(body){
	// 		console.log("get body:"+JSON.stringify(body));
	// 	}).catch(function (error){
	// 		console.log("get error:"+error);
	// 	}).done();
	// 	await p;
	// 	console.log("okok:");
	// 	return p;
	// });
});