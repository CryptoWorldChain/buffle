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


contract TokenStore is LockIdGen {
    using SafeMath for uint256;
    struct ChangeRequest {
        address proposedNew;
        address proposedClear;
    }
    uint256     public    mancount  ;


    // address public custodian;
    mapping (address => address) public managers;

    mapping (address => uint256) public balances;


    mapping (bytes32 => ChangeRequest) public changeReqs;


    mapping (address => mapping(address=>uint256)) public testmapp2;
    mapping (address => mapping(address=>mapping(address=>uint256))) public testmapp3;


    ERC20 public token1;


    // CONSTRUCTOR
    constructor(
        address []_mans
    )
    LockIdGen()
      public
    {
        uint256 numMans = _mans.length;
        mancount = numMans*10;
        for (uint256 i = 0; i < numMans; i++) {
          address pto = _mans[i];
          require(pto != address(0));
          managers[pto] = pto;
          testmapp2[pto][pto] = 2222;
          testmapp3[pto][pto][pto] = 3333;

        }
        token1 = ERC20(0x0000000000000000000000000000004755535320);
    }

    function addManager(address _addr) public returns(bool success){         
         managers[_addr] = address(_addr);//_addr;
         testmapp2[_addr][_addr] = 2;
         testmapp3[_addr][_addr][_addr] = 3;
         mancount = mancount + 1;
         return true;

    }

    function removeManager(address _addr) public returns(bool success){
        if(managers[_addr]!=0x0){
             delete managers[_addr];
             mancount = mancount - 1;
             return true;
        }else{
            return false;
        }
        
    }

    function getTokenTotalSupply() public view returns(uint256 totals){
        return token1.totalSupply();
    }
 
    function depositToken(uint256 value) public payable returns (bool success){
        token1.transferFrom(msg.sender,address(this),value);
        balances[msg.sender] = balances[msg.sender].add(value);
        return true;
    }

    function withdrawToken(uint256 value) public payable returns (bool success){
        if(balances[msg.sender]>=value){
          balances[msg.sender] = balances[msg.sender].sub(value);
          token1.transfer(msg.sender,value);
          return true;
        }
        else{
          return false;
        }
    }
    function transOutToken(address to,uint256 value) public payable returns (bool success){
        if(managers[msg.sender]==msg.sender){
          token1.transfer(to,value);
          return true;
        }else{
               return false;
 
        }
    }


    function getTokenBalance(address addr) public view returns(uint256 totals){
        return token1.balanceOf(addr);
    }
    
    function transOutCWV(address _out,uint256 amount) public returns(bool success){
        address(_out).transfer(amount);
        return true;
    }

     function getCWVBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // for manager change
    function requestChange(address _new,address _clear) public returns (bytes32 lockId) {
        require( _clear != address(0) || _new != address(0) );

        require( _clear == address(0) || managers[_clear] == _clear);

        lockId = generateLockId();

        changeReqs[lockId] = ChangeRequest({
            proposedNew: _new,
            proposedClear: _clear
        });

        emit ChangeRequested(lockId, msg.sender, _new,_clear);
    }

    event ChangeRequested(
        bytes32 _lockId,
        address _msgSender,
        address _new,
        address _clear
    );


   function confirmChange(bytes32 _lockId) public  {
        ChangeRequest storage changeRequest = changeReqs[_lockId];
        require( changeRequest.proposedNew != address(0) || changeRequest.proposedClear != address(0));

        if(changeRequest.proposedNew != address(0))
        {
            managers[changeRequest.proposedNew] = changeRequest.proposedNew;
            mancount = mancount + 1;
        }

        if(changeRequest.proposedClear != address(0))
        {
            delete managers[changeRequest.proposedClear];
            mancount = mancount - 1;
        }

        delete changeReqs[_lockId];

        emit ChangeConfirmed(_lockId, changeRequest.proposedNew,changeRequest.proposedClear);
    }
    event ChangeConfirmed(bytes32 _lockId, address _newCustodian, address _clearCustodian);

    function sweepChange(bytes32 _lockId) public  {
        ChangeRequest storage changeRequest=changeReqs[_lockId];
        require(changeRequest.proposedNew != 0 || changeRequest.proposedClear != 0 );
        delete changeReqs[_lockId];
        emit ChangeSweep(_lockId, msg.sender);
    }
    event ChangeSweep(bytes32 _lockId, address _sender);


}

