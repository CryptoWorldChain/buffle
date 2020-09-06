import Buffle from "./global";
import contractMock from "./contractMock"
import sleep from 'sleep'

export async function deploy(contract,opts) {
	// console.log("contract to deploy=="+JSON.stringify(contract));
	if(contract){
		// console.log("deploy param1="+arguments[1]);
		var args = Array.prototype.slice.call(arguments).slice(1,arguments.length)
		return contract.doDeploy.apply(contract,args);
	}

}