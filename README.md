
<img src="https://cwv.io/images/logo1Normal.svg" width="100">

### buffle
-----------------------

buffle Provide contract compilation, crc20 create call, crc721 create call, etc.

By default, 10 users will be created

### 安装
```js
npm install @cwv/buffle -g
```

### 代码结构说明
<pre>                      
├── accounts                       
│   └── init.js                       
├── config
│   └── default.json                       //配置文件
├── contracts                              //合约目录
│   └── testerc21.sol                      //测试合约
├── gulpfile.js
├── keystore                               //keystore目录,默认创建10个用户
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
│   └── buffle                       //水牛源码目录
│       ├── accounts.js              //address、keystore操作
│       ├── contractMock.js          //合约模拟数据
│       ├── contractbuild.js         //合约编译
│       ├── cwvmockup.js             //调用cwv.js sdk
│       ├── cwvtxtype.js             //交易类型
│       ├── deployer.js
│       ├── global.js                //全局cwv.js调用设置
│       ├── index.js                 //入口程序
│       ├── mocha_preload.js         //mocha测试文件
│       ├── run.js                   //运行代码
│       └── utils.js                 //工具类
├── test                             //测试示例
│   ├── test.djs
│   ├── testcontract.mjs             //合约调用
│   ├── testcontracttransfer.djs     //合约调用
│   ├── testcrc20.djs                //创建crc20,调用crc20
│   ├── testcrc721.djs               //创建crc721,调用crc721
│   ├── testcwvrand.djs              //随机合约调用
│   ├── testerc20tokens.djs          //crc20合约操作
│   └── testerc21tokens.js           //crc721合约操作
└── webpack.buffle.config.js
</pre>

