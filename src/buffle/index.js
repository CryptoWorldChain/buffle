
import run  from "./run";
import path from 'path';

const VERSION = "v1.0.0";


// console.log("version:F17::"+VERSION+",cwv="+cwv) 
//global.window = new Object();
export default {
	version:VERSION,
	runner:run,
	doRun:function(){
		run.buildAndRun();
	}
};

run.buildAndRun();