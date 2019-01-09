pragma solidity ^0.4.23;

contract CWVRndBasic {

        function generateRnd() public view returns (bytes32 randid);
        function generateRnd(uint256 ran_timestamp,uint256 rand_seed) public  returns (bytes32 randid);
        function getBlockNum() public view returns (uint256 randid);
        function getBlockTimestamp() public view returns (uint256 randid);
}
    



contract CWVRandImpl is CWVRndBasic{
    
    uint256 public lockRequestCount;

    constructor () public {
        lockRequestCount = 0;
    }


    function generateRnd() public view returns (bytes32 randid){
        return keccak256(abi.encodePacked(blockhash(block.number-1), address(this),lockRequestCount));
    }

    function getBlockNum() public view returns (uint256 randid){
        return block.number;
    }
    
    function getBlockTimestamp() public view returns (uint256 randid){
        return block.timestamp;
    }
    
    function generateRnd(uint256 ran_timestamp,uint256 rand_seed) public returns (bytes32 randid){
        lockRequestCount = lockRequestCount+1;
        return keccak256(abi.encodePacked(ran_timestamp, address(this), rand_seed+lockRequestCount));
    }

}

