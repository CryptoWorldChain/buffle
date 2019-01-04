import  Mocha  from 'mocha'
import  fs from 'fs'
import  path from 'path';
// Instantiate a Mocha instance.
// var mocha = new Mocha();
import { using } from 'mocha-params';

var mocha=new Mocha();
mocha.addFile( path.join(__dirname,'mocha_preload.js' ));
console.log("==============run mocha=================:"+new Date())
// // Run the tests.

mocha.run(function(failures) {
  console.log("--------mocha--end-----------:"+new Date())
});

export default {
	testdir:"__dirname",
	mocha:mocha

}

