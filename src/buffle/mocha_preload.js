
var path = require('path');
var JSDOM = require('mocha-jsdom')
var sleep = require('sleep')
var assert = require('assert');
const sinon = require('sinon');

const  rp = require ('request-promise');
const  Test = require( 'mocha/lib/test');
const  fs 	= require( 'fs');
const contractbuild =  require('./contractbuild.js')
const deployer = require('./deployer.js')
var Buffle = require('./global.js')



const dom = new JSDOM({
  url: "http://localhost/"
});

 // javascript
var originit=it;

var	httpPostStub = sinon.stub(rp,'post'); // stub http so we can change the response

it("@Init Buffle",function(done){
	const bundle = require('@cwv/cwv.js');//path.join(__dirname,"../", 'dist', 'cwvbuffle.js'));
	Buffle.cwv=bundle.cwv;
	console.log("cwv version="+bundle.cwv["version"]);
	Buffle.cwv.rpc.setMockRequest(rp); 
	done();
})

it('@Load Contract Test', function(){
	this.timeout(1000000);
	describe('', function(){
		//sleep.sleep(10)
		this.timeout(1000000);
		var preloadaccts=["a","b","c"];

		var bit = function (title, fn) {
			originit(title, function(done){
				fn(preloadaccts);
				done();
			})
		}

		var contract = function(title,fn){
			// console.log("calling contract:"+title+",cwv="+cwv);
			fn(preloadaccts,cwv);
		}
	 
		global.it = bit
		global.cwv=Buffle.cwv;
		global.artifacts = contractbuild;
		global.deployer = deployer;
		global.contract = contract;
		var testDir =path.join(__dirname, '../test');
		fs.readdirSync(testDir).filter(function(file) {
		    return file.substr(-3) === '.js';
		}).forEach( function(file) {
			var contractfile = require(path.join(testDir,file));
		});

	})	
})

