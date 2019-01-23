
<img src="https://cwv.io/images/logo1Normal.svg" width="100">

### buffle
-----------------------

buffle Provide contract compilation, crc20 create call, crc721 create call, etc.

By default, 10 users will be created

### Install
```js
$ npm install @cwv/buffle -g
```

### Code structure description
<pre>                      
├── accounts                       
│   └── init.js                       
├── config
│   └── default.json                       //Configuration file
├── contracts                              //Contract directory
│   └── testerc21.sol                      //Test contract
├── gulpfile.js
├── keystore                               //keystore Directory, create 10 users by default
│   ├── keystore-0.json
│   ├── keystore-1.json
│   ├── keystore-2.json
│   ├── keystore-3.json
│   ├── keystore-4.json
│   ├── keystore-5.json
│   ├── keystore-6.json
│   ├── keystore-7.json
│   ├── keystore-8.json
│   └── keystore-9.json
├── package-lock.json
├── package.json
├── src
│   └── buffle                       //buffle Source directory
│       ├── accounts.js              //Address, keystore operation
│       ├── contractMock.js          //Contract simulation data
│       ├── contractbuild.js         //Contract compilation
│       ├── cwvmockup.js             //call cwv.js sdk
│       ├── cwvtxtype.js             //Transaction Type
│       ├── deployer.js
│       ├── global.js                //Global cwv.js call settings
│       ├── index.js                 //Entry procedure
│       ├── mocha_preload.js         //mocha test file
│       ├── run.js                   //Running code
│       └── utils.js                 //tools
├── test                             //Test example
│   ├── test.djs
│   ├── testcontract.mjs             //Contract call
│   ├── testcontracttransfer.djs     //Contract call
│   ├── testcrc20.djs                //create crc20,call crc20
│   ├── testcrc721.djs               //create crc721,call crc721
│   ├── testcwvrand.djs              //Random contract call
│   ├── testerc20tokens.djs          //crc20 operation
│   └── testerc21tokens.js           //crc721 operation
└── webpack.buffle.config.js
</pre>

