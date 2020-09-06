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
    uint256     public    mancount  ;


    // address public custodian;
    mapping (address => address) public managers;
    //管理接口
    mapping (bytes32 => ChangeRequest) public changeReqs;


    // 地址余额
    mapping (address => uint256) public balances0;
    mapping (address => uint256) public balances1;



    //币种地址
    ERC20 public token0;
    ERC20 public token1;


    //流动池余额大小
    uint256  public poolBalance0;
    uint256  public poolBalance1;
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
        return true;
    }

    //用户交换币种
    function swap(uint256 value0,uint256 value1) public payable returns (bool success){
        require(value0>0||value1>0);//得有一个大于零，但不能同时大于0
        if(value0>0&&value1>0){
          return false;
        }
        if(value0>0){
          require(token0.transferFrom(msg.sender,address(this),value0));
          poolBalance0 = poolBalance0.add(value0);
          uint256 new_poolBalance1 = const_K.div(poolBalance0);
          uint256 n_value1=poolBalance1.sub(new_poolBalance1);
                  
          require(token1.transfer(msg.sender,n_value1));

          poolBalance1 = new_poolBalance1;
          return true;
        }else if (value1>0){
          require(token1.transferFrom(msg.sender,address(this),value1));
          poolBalance1 = poolBalance1.add(value1);
          uint256 new_poolBalance0 = const_K.div(poolBalance1);
          uint256 n_value0=poolBalance0.sub(new_poolBalance0);                  
          require(token0.transfer(msg.sender,n_value0));
          poolBalance0 = new_poolBalance0;
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
        if(value0>0){
          require(token0.transferFrom(msg.sender,address(this),value0));
          poolBalance0 = poolBalance0.add(value0);
          uint256 new_poolBalance1 = const_K.div(poolBalance0);
          uint256 n_value1=new_poolBalance1.add(poolBalance1);                  
          require(token1.transferFrom(msg.sender,address(this),n_value1));
          poolBalance1 = new_poolBalance1;        
          return true;
        }else if (value1>0){
          require(token1.transferFrom(msg.sender,address(this),value1));
          poolBalance1 = poolBalance1.add(value1);
          uint256 new_poolBalance0 = const_K.div(poolBalance1);
          uint256 n_value0=new_poolBalance0.add(poolBalance0);                  
          require(token0.transferFrom(msg.sender,address(this),n_value0));
          poolBalance0 = new_poolBalance0;
          return true;
        }else{
          return false;
        }
    }

}

