
import fs from 'fs';

import path from 'path';

var _checkDir = function(dirname){
		var testDir = path.join(__dirname,dirname);
		if(fs.existsSync(testDir)){
			return testDir;
		}
		testDir = path.join(__dirname,'..',dirname);
		if(fs.existsSync(testDir)){
			return testDir;
		}
		testDir =path.join(__dirname,'..','..',dirname);
		if(fs.existsSync(testDir)){
			return testDir;
		}
		return NaN;
}


export default{
	checkDir: _checkDir

}