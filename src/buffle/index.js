
import run  from "./run";

const VERSION = "v1.0.0";

export default {
	version:VERSION,
	runner:run,
	doRun:function(){
		run.buildAndRun();
	}
};

run.buildAndRun();