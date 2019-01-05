import Buffle from "./global";
import contractMock from "./contractMock"
import sleep from 'sleep'

export async function deploy(contract) {
	
	console.log("contract to deploy=="+contract);
	if(contract){
		return contract.doDeploy(Buffle.cwv);
	}

}