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


contract ERC721  {
    function balanceOf(address _owner) external view returns (uint256);
    function ownerOf(uint256 _tokenId) external view returns (address);
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) external payable returns (bool);
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable returns (bool);
    function transferFrom(address _from, address _to, uint256 _tokenId) external payable returns (bool);
}

contract ERC721Enumerable is ERC721 {
    function totalSupply() external view returns (uint256);
    function tokenByIndex(uint256 _index) external view returns (uint256);
    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256);
}


contract Token21Store is LockIdGen {
    using SafeMath for uint256;
    struct ChangeRequest {
        address proposedNew;
        address proposedClear;
    }
    uint256     public    mancount  ;


    // address public custodian;
    mapping (address => address) public managers;


    mapping (uint256 => address) public tokenStores;

    mapping (uint256 => address) public tokenOwners;


    mapping (bytes32 => ChangeRequest) public changeReqs;


    mapping (address => mapping(address=>uint256)) public testmapp2;
    mapping (address => mapping(address=>mapping(address=>uint256))) public testmapp3;


    ERC721Enumerable public token21;


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
        token21 = ERC721Enumerable(0x0000000000000000000000000000474755535321);
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
 
    function getAllBalance() public view returns (uint256) {
        return token21.balanceOf(address(this));
    }

    function getBalanceOf(address _addr) public view returns (uint256) {
        return token21.balanceOf(_addr);
    }
    function ownerOf(uint256 _tokenId) public view returns (address) {
        return token21.ownerOf(_tokenId);
    }
    
    function totalSupply() external view returns (uint256){
        return token21.totalSupply();
    }
    function tokenByIndex(uint256 _index) external view returns (uint256){
        return token21.tokenByIndex(_index);
    }
    function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256){
      return token21.tokenOfOwnerByIndex(_owner,_index);
    }


    function depositTokenWithData(uint256 _tokenId, bytes _data) public payable returns (bool success){
        token21.safeTransferFrom(msg.sender,address(this),_tokenId,_data);
        tokenStores[_tokenId] = address(msg.sender);
        tokenOwners[_tokenId] = msg.sender;
        return true;
    }

    function withdrawToken(uint256 _tokenId) public payable returns (bool success){
        if(tokenOwners[_tokenId]==msg.sender){
          delete tokenStores[_tokenId];
          delete tokenOwners[_tokenId];

          token21.transferFrom(address(this),msg.sender,_tokenId);

          return true;
        }
        else{
          return false;
        }
    }

     function depositToken(uint256 _tokenId) public payable returns (bool success){
        token21.safeTransferFrom(msg.sender,address(this),_tokenId);
        tokenStores[_tokenId] = address(msg.sender);
        tokenOwners[_tokenId] = msg.sender;
        return true;
    }


  

    function transOutToken(address to,uint256 _tokenId) public payable returns (bool success){
        if(managers[msg.sender]==msg.sender){
          delete tokenStores[_tokenId];
          delete tokenOwners[_tokenId];

          token21.transferFrom(address(this),to,_tokenId);
          return true;
        }else{
          return false;
        }
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

