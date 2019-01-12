//https://solidity-cn.readthedocs.io/zh/develop/

/**
 * test create crc721
 */
const symbol='house';
const amount='1000000000000000000000000000'

it('test.2-create-crc721', async function(accounts) {
    console.log("test create-crc721:accounts=="+accounts+",cwv="+JSON.stringify(cwv))
    //get nonce
    let p = cwv.checkAndSetNonce(accounts[0]);
    await p;

    let names=[{
        name:'',code:''
    }]
    cwv.createCRC721({
        symbol:'house',total:names.length,exdata:'',names:names
    }).then(function(result){
        console.log("create crc721===>",result)
    }).catch(function(err){
        console.log("err=>>>",err)
    })
})
/**
 * call crc721
 */
// it('test.2-call-crc721', async function(accounts) {
//     console.log("test call-crc721:accounts=="+accounts+",cwv="+JSON.stringify(cwv))
//     //get nonce
//     var p = cwv.checkAndSetNonce(accounts[0]).then(function(body){
//         console.log("current nonce======>",body);
//     }).catch(function (error){
//         console.log("get error:"+error);
//     });
//     await p;

//     cwv.callCRC721({
//         symbol:symbol,to:[
//             {'addr':'ba363efb1742f0a0487efbdf57f023374c9c40d3','symbol':symbol},
//             {'addr':'4ea1f354e61932422eb3cfc45e50446a831a7407','symbol':symbol},
//             {'addr':'38e2d6af03bce30f5b4040456242f66519636a48','symbol':symbol}
//         ]
//     }).then(function(result){
//         console.log("call crc721======>",result)
//     }).catch(function(err){
//         console.log(err)
//     })
// })