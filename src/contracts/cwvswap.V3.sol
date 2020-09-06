pragma solidity ^0.4.23;


library SafeMath {
  function mul(uint256 a, uint256 b) internal pure returns (uint256) {
    if (a == 0) {
      return 0;
    }
    uint256 c = a * b;
    assert(c / a == b);
    return c;
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }

  function sub(uint256 a, uint256 b) internal pure returns (uint256) {
    assert(b <= a);
    return a - b;
  }

  function add(uint256 a, uint256 b) internal pure returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}



contract LockIdGen {

    uint256 public requestCount;

    constructor() public {
        requestCount = 0;
    }

    function generateLockId() public returns (bytes32 lockId) {
        return keccak256(abi.encodePacked(blockhash(block.number-1), address(this), ++requestCount));
    }
}

contract ERC20Basic {
  // events
  event Transfer(address indexed from, address indexed to, uint256 value);

  // public functions
  function totalSupply() public view returns (uint256);
  function balanceOf(address addr) public view returns (uint256);
  function transfer(address to, uint256 value) public returns (bool);
}


contract ERC20 is ERC20Basic {
  // events
  event Approval(address indexed owner, address indexed agent, uint256 value);

  // public functions
  function allowance(address owner, address agent) public view returns (uint256);
  function transferFrom(address from, address to, uint256 value) public returns (bool);
  function approve(address agent, uint256 value) public returns (bool);

}


contract CWVSwap is LockIdGen {
    using SafeMath for uint256;
    struct ChangeRequest {
        address proposedNew;
        address proposedClear;
    }
    uint256 public mancount  ;


    // address public custodian;
    mapping (address => address) public managers;
    //管理接口
    mapping (bytes32 => ChangeRequest) public changeReqs;


    //币种地址
    ERC20 public token0;
    ERC20 public token1;

    //ERC20 public tokenL;//流动性代币

    // 记录每个地址的流动代币
    mapping (address => uint256) public liquidBalances;

    //流动池余额大小
    uint256  public poolBalance0;
    uint256  public poolBalance1;

    uint256  public  poolLiquidity ;//总流动性
    uint256  public  fee_ratio ;//万分之手续费

    //常量
    uint256 public  const_K;


    // CONSTRUCTOR
    constructor(
        address _token0,
        address _token1,        
        address []_mans
    )
    LockIdGen()
      public
    {

        require(_token0!=_token1);

        uint256 numMans = _mans.length;
        mancount = numMans;
        for (uint256 i = 0; i < numMans; i++) {
          address pto = _mans[i];
          require(pto != address(0));
          managers[pto] = pto;
          //testmapp2[pto][pto] = 2222;
          //testmapp3[pto][pto][pto] = 3333;
        }

        token0 = ERC20(_token0);
        token1 = ERC20(_token1);   
        status = 0;     
        fee_ratio = 30;

    }

    int  public status ;
     //初始化池子，只有管理员才能操作
    function initPool(uint256 value0,uint256 value1) public payable returns (bool success){

        require(status==0,"initpool status error");
        require(managers[msg.sender]==msg.sender,"initpool mangers error");
        
        token0.transferFrom(msg.sender,address(this),value0);
        token1.transferFrom(msg.sender,address(this),value1);

        

        poolBalance0 = value0;
        poolBalance1 = value1;  

        const_K = poolBalance0.mul(poolBalance1);
        poolLiquidity = value1.mul(2);


        return true;
    }

    //增加流动性池子的代币，建议多打一点
    function addLiquidToken(uint256 value) public payable returns (bool success){
        require(value>0);
       // tokenL.transferFrom(msg.sender,address(this),value);
        return true;
    }

    //用户交换币种
    function swap(uint256 value0,uint256 value1) public payable returns (bool success){
        require(value0>0||value1>0);//得有一个大于零，但不能同时大于0
        if(value0>0&&value1>0){
          return false;
        }
        uint256 fee;
        uint256 real_buy_value;
        if(value0>0){
            require(token0.transferFrom(msg.sender,address(this),value0));
            //计算手续费
          fee=fee_ratio.mul(value0).div(10000);
          real_buy_value = value0.sub(fee);
          //增加流动性
          poolLiquidity = poolLiquidity.add(fee.mul(poolBalance1).div(poolBalance0));

          poolBalance0 = poolBalance0.add(real_buy_value);
          uint256 new_poolBalance1 = const_K.div(poolBalance0);
          uint256 new_value1=poolBalance1.sub(new_poolBalance1);
          require(token1.transfer(msg.sender,new_value1));

          poolBalance1 = new_poolBalance1;
          const_K = poolBalance1.mul(poolBalance0);
          return true;
        }else if (value1>0){
          require(token1.transferFrom(msg.sender,address(this),value1));
          //计算手续费
          fee=fee_ratio.mul(value1).div(10000);
          real_buy_value = value1.sub(fee);
          //增加流动性
          poolLiquidity = poolLiquidity.add(fee);

          poolBalance1 = poolBalance1.add(real_buy_value);
          uint256 new_poolBalance0 = const_K.div(poolBalance1);
          uint256 new_value0=poolBalance0.sub(new_poolBalance0);                  
          require(token0.transfer(msg.sender,new_value0));
          poolBalance0 = new_poolBalance0;

          const_K = poolBalance1.mul(poolBalance0);
          return true;
        }else{
          return false;
        }
    }

    //用户增加流动性
    function addLiquid(uint256 value0,uint256 value1) public payable returns (bool success){
        require(value0>0||value1>0);//得有一个大于零，但不能同时大于0
        if(value0>0&&value1>0){
          return false;
        }
        uint256 poolBalance;
        uint256 mine;
        uint256 addPool;
        if(value0>0){//cwveth

            value1 = value0.mul(poolBalance1).div(poolBalance0);
            poolBalance = poolBalance1.mul(2);
            mine = poolLiquidity.mul(value1).mul(2).div(poolBalance);
            require(mine>0);

            require(token0.transferFrom(msg.sender,address(this),value0));
            require(token1.transferFrom(msg.sender,address(this),value1));

            //增加地址持有量
            //require(tokenL.transfer(msg.sender,mine));
            liquidBalances[msg.sender] = liquidBalances[msg.sender].add(mine);
          

            //总增加金额
            addPool = value1.mul(2);
            poolLiquidity = poolLiquidity.add(addPool);

            poolBalance0 = poolBalance0.add(value0);
            poolBalance1 = poolBalance1.add(value1);
            const_K = poolBalance0.mul(poolBalance1);

            return true;
        }else if (value1>0){ //token
          value0 = value1.mul(poolBalance0).div(poolBalance1);
          poolBalance = poolBalance1.mul(2);
          mine = poolLiquidity.mul(value1).mul(2).div(poolBalance);
          require(mine>0);

          require(token0.transferFrom(msg.sender,address(this),value0));
          require(token1.transferFrom(msg.sender,address(this),value1));

          //增加地址持有量
          //require(tokenL.transfer(msg.sender,mine));
          liquidBalances[msg.sender] = liquidBalances[msg.sender].add(mine);
          

          //总增加金额
          addPool = value1.mul(2);
          poolLiquidity = poolLiquidity.add(addPool);

          poolBalance0 = poolBalance0.add(value0);
          poolBalance1 = poolBalance1.add(value1);
          const_K = poolBalance0.mul(poolBalance1);

          return true;
        }else{
          return false;
        }
    }

    //用户取出流动性
    function removeLiquid(uint256 value) public payable returns (bool success){

        //require(value>=tokenL.balanceOf(msg.sender));

        require(value>=liquidBalances[msg.sender]);
        //计算每个流动性代币的收益


        poolLiquidity = poolLiquidity.sub(value);

        uint256 poolBalance = poolBalance1.mul(2);
        uint256 mine1 = value.mul(poolLiquidity).div(poolBalance).div(2);
        uint256 mine0 = mine1.mul(poolBalance0).div(poolBalance1);

        poolBalance0 = poolBalance0.sub(mine0);
        poolBalance1 = poolBalance1.sub(mine1);
        const_K = poolBalance0.mul(poolBalance1);


        //require(tokenL.transferFrom(msg.sender,address(this),value));

        liquidBalances[msg.sender] = liquidBalances[msg.sender].sub(value);

        require(token0.transfer(msg.sender,mine0));
        require(token1.transfer(msg.sender,mine1));

        return true;
    }

    //转让流动性代币
    function transferLiquid(address to,uint256 value) public payable returns (bool success){
        require(value>=liquidBalances[msg.sender]);
        liquidBalances[msg.sender] = liquidBalances[msg.sender].sub(value);
        liquidBalances[to] = liquidBalances[to].add(value);
        return true;
    }


}

