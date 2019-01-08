import Buffle from "./global";
import contractMock from "./contractMock"
import sleep from 'sleep'

export async function deploy(contract,opts) {
	
	// console.log("contract to deploy=="+JSON.stringify(contract));
	if(contract){
		return contract.doDeploy(Buffle.cwv,opts).then(function (body){

			console.log("get contractok:"+body);
		});
	}

}