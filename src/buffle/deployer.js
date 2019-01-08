import Buffle from "./global";
import contractMock from "./contractMock"
import sleep from 'sleep'

export async function deploy(contract,opts) {
	
	// console.log("contract to deploy=="+JSON.stringify(contract));
	if(contract){
		return contract.doDeploy(Buffle.cwv,opts).then(function (body){
			console.log("contract.doDeploy.return body=="+body)
			if(body){
				var jsbody = JSON.parse(body);
				if(jsbody.contractHash){
					var inst = new contractMock.ContractInstance(contract,jsbody.contractHash,jsbody.txHash)
					console.log("create Contract OKOK:"+inst.constructor.name);
					return inst;
				}
			}			
			return NaN;
		});
	}

}