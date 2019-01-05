

import run  from "./run";
import path from 'path';

import contractbuild from './contractbuild';


const VERSION = "v1.0.0";

// console.log("version:F17::"+VERSION+",cwv="+cwv) 
contractbuild.compile();

export default {
	version:VERSION,
	runner:run,
	build:contractbuild.compile
};
