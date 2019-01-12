//https://solidity-cn.readthedocs.io/zh/develop/

/**
 * test create crc20
 */
const token='BBB';
const amount='1000000000000000000000000000'
//example txhas:e12828870762121aa814c3238c2421808c09868df1da573adb3f6dbadf830d5c
// it('test.2-create-crc20', async function(accounts) {
//     console.log("test create-crc20:accounts=="+accounts+",cwv="+JSON.stringify(cwv))
//     //get nonce
//     var p = cwv.checkAndSetNonce(accounts[0]).then(function(body){
//         console.log("current nonce======>",body);
//     }).catch(function (error){
//         console.log("get error:"+error);
//     });
//     await p;
//     cwv.createCRC20({
//         token:token,amount:amount
//     }).then(function(result){
//         console.log("create crc20===>",result)
//     }).catch(function(err){
//         console.log("err=>>>",err)
//     })
// })
/**
 * call crc20
 */
// it('test.2-call-crc20', async function(accounts) {
//     console.log("test call-crc20:accounts=="+accounts+",cwv="+JSON.stringify(cwv))
//     //get nonce
//     var p = cwv.checkAndSetNonce(accounts[0]).then(function(body){
//         console.log("current nonce======>",body);
//     }).catch(function (error){
//         console.log("get error:"+error);
//     });
//     await p;

//     cwv.callCRC20({
//         token:token,amount:'600000000000000000000',to:[
//             {'addr':'ba363efb1742f0a0487efbdf57f023374c9c40d3','amount':'200000000000000000000'},
//             {'addr':'4ea1f354e61932422eb3cfc45e50446a831a7407','amount':'200000000000000000000'},
//             {'addr':'38e2d6af03bce30f5b4040456242f66519636a48','amount':'200000000000000000000'}
//         ]
//     }).then(function(result){
//         console.log("call crc20e======>",result)
//     }).catch(function(err){
//         console.log(err)
//     })
// })