
var path = require('path');
var JSDOM = require('mocha-jsdom')
var sleep = require('sleep')
var assert = require('assert');
const sinon = require('sinon');

const rp = require ('request-promise');
const  Test = require( 'mocha/lib/test');
const  fs 	= require( 'fs');



// const Module = require('module');

// const originalCompile = Module.prototype._compile;
// const nohook = function (content, filename, done) {

//     return done(content);
// };

// let currentHook = nohook;
// Module.prototype._compile = function (content, filename) {

//     const self = this;
//     currentHook(content, filename, (newContent) => {

//         newContent = newContent || content;
//         // console.log("newContent=="+newContent);


//         originalCompile.call(self, newContent, filename);
//     });
// };

const dom = new JSDOM({
  url: "http://localhost/"
});

 // javascript
var cwv;

var originit=it;

var	httpPostStub = sinon.stub(rp,'post'); // stub http so we can change the response


// describe('#testall', function(){
	
	
// 	// console.log("hello::.1 .:suit=="+suites); 
// 	// var httpPostStub;
// 	// beforeEach(function() {
	
// 	// 	httpPostStub = sinon.stub(rp,'post'); // stub http so we can change the response
// 	// });

// 	// afterEach(function() {
// 	// 	httpPostStub.restore();
// 	// });
// 	//console.log("suit=="+Suite);
// 	originit("init",function(){
// 		const bundle = require('@cwv/cwv.js');//path.join(__dirname,"../", 'dist', 'cwvbuffle.js'));
// 		cwv=bundle.cwv;
// 		console.log("cwv version="+bundle.cwv["version"]+",cwv="+cwv);
// 		cwv.rpc.setMockRequest(rp); 
// 	})


// 	// it('test.1-getbalance', async function(accounts) {
// 	// 	console.log("accounts.getbalance="+accounts[0])
// 	// 	var p = cwv.rpc.getBalance("df2fc3cdc723c8f5be2f51b5d051ace6264008ad").then(function(body){
// 	// 		console.log("get body:"+JSON.stringify(body));
// 	// 	}).catch(function (error){
// 	// 		console.log("get error:"+error);
// 	// 	}).done();
// 	// 	await p;
// 	// 	console.log("okok:");
// 	// 	return p;
// 	// });
// });

// describe('##total ', function(){
	// console.log("init");
	it("@Init Buffle",function(done){
		const bundle = require('@cwv/cwv.js');//path.join(__dirname,"../", 'dist', 'cwvbuffle.js'));
		cwv=bundle.cwv;
		console.log("cwv version="+bundle.cwv["version"]);
		cwv.rpc.setMockRequest(rp); 
		done();
		console.log("\n\n\n\n");
		
	})


	it('@Load Contract Test', function(){
		describe('', function(){
			//sleep.sleep(10)
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
			global.cwv=cwv;
			global.contract = contract;
			var testDir =path.join(__dirname, '../test');
			fs.readdirSync(testDir).filter(function(file) {
			    return file.substr(-3) === '.js';
			}).forEach( function(file) {
				var contractfile = require(path.join(testDir,file));
			});

		})	
	})



// })

