//https://solidity-cn.readthedocs.io/zh/develop/

/**
 * test create crc721
 */
const symbol='good';
const total=10000;
const cryptotoken='c2f651cea3b93b4fa95b27bb1c0139f021fcd4a8a0fd9cc25fcbefde4008a0f3';

it('test.2-create-crc721', async function(accounts) {
    console.log("test create-crc721:accounts=="+accounts+",cwv="+JSON.stringify(cwv))
    //get nonce
    var p = cwv.checkAndSetNonce(accounts[0])
    await p;

    let names=[{
        name:'测试',code:'1'
    }]
    cwv.createCRC721({
        symbol:symbol,total:total,exdata:'测试',names:names
    }).then(function(result){
        console.log("create crc721===>",result)
    }).catch(function(err){
        console.log("err=>>>",err)
    })
})
/**
 * call crc721
 */
it('test.2-call-crc721', async function(accounts) {
    console.log("test call-crc721:accounts=="+accounts+",cwv="+JSON.stringify(cwv))
    //get nonce
    var p = cwv.checkAndSetNonce(accounts[0]);
    await p;

    cwv.callCRC721({
        symbol:symbol,
        cryptotoken:cryptotoken,
        amount:'20000000000000000000',
        to:"ba363efb1742f0a0487efbdf57f023374c9c40d3"
    }).then(function(result){
        console.log("call crc721======>",result)
    }).catch(function(err){
        console.log(err)
    })
})