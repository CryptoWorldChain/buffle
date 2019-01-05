
import  fs from 'fs'
import  path from 'path';
// Instantiate a Mocha instance.
// var mocha = new Mocha();




var _buildAndRun = function(){
		console.log(" ============== compiling ================= ")
		var  Mocha =require('mocha')
		var contractbuild = require( './contractbuild.js')
		contractbuild.compile();
		var mocha=new Mocha();
		mocha.addFile( path.join(__dirname,'mocha_preload.js' ));
		console.log(" --------------run test------------------ ")
		// // Run the tests.

		mocha.run(function(failures) {
		  console.log(" -----------------test end----------- ")
		  	console.log("failures=="+failures)
		});
	};


export default {
	testdir:"__dirname",
	buildAndRun:_buildAndRun
}

