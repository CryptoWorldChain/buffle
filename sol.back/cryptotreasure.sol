
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

    function generateLockId() internal returns (bytes32 lockId) {
        return keccak256(abi.encodePacked(blockhash(block.number-1), address(this), ++requestCount));
    }
}


contract ManagerUpgradeable is LockIdGen {

    struct ChangeRequest {
        address proposedNew;
        address proposedClear;
    }

    // address public custodian;
    mapping (address => address) public managers;

    mapping (bytes32 => ChangeRequest) public changeReqs;

    uint256     public    mancount  ;

    // CONSTRUCTOR
    constructor(
        address []_mans
    )
      LockIdGen()
      public
    {
        uint256 numMans = _mans.length;
        for (uint256 i = 0; i < numMans; i++) {
          address pto = _mans[i];
          require(pto != address(0));
          managers[pto] = pto;
        }
        mancount = numMans;
    }

    modifier onlyManager {
        require(msg.sender == managers[msg.sender]);
        _;
    }

    function getManCount() public view returns (uint256 count){
        return mancount;
    }

    // for manager change
    function requestChange(address _new,address _clear) public onlyManager returns (bytes32 lockId) {
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

   function confirmChange(bytes32 _lockId) public onlyManager {
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

    function sweepChange(bytes32 _lockId) public onlyManager {
        ChangeRequest storage changeRequest=changeReqs[_lockId];
        require(changeRequest.proposedNew != 0 || changeRequest.proposedClear != 0 );
        delete changeReqs[_lockId];
        emit ChangeSweep(_lockId, msg.sender);
    }
    event ChangeSweep(bytes32 _lockId, address _sender);

}

contract TokenProxy is ManagerUpgradeable{
    
    using SafeMath for uint256;
    
    ERC20    public     erc20Token;
    uint256  public     totalBalance;

    mapping(address => uint256) public  balsByUser;
    mapping(address => uint256) public  frezsByUser;
    

//token的symbol
    string  public      symbol;

    constructor(string _symbol ,address _erc20,address []_mans)public ManagerUpgradeable(_mans)  {
        require(_erc20 != address(0));
        symbol=_symbol;
        erc20Token = ERC20(_erc20);
    }

    function sendOut1(address _to,uint256 _value) public payable onlyManager  returns (bool success){
        address  []memory _tos=new address [](1);
        uint256  []memory _values = new uint256[](1);
        _tos[0]=_to;
        _values[0] = _value;

        return sendOut(_tos,_values);
    }
    
    function deposit(uint256 _value) public payable returns (bool success){
        require(msg.sender != address(0));
        require(_value > 0);

        require (erc20Token.balanceOf(msg.sender) >= _value);
        // user must call prove first.
        require (erc20Token.transferFrom(msg.sender,this,_value));
        balsByUser[msg.sender] = balsByUser[msg.sender].add(_value);
        totalBalance = totalBalance.add(_value);
        //emit TokenAdd(msg.sender,_value);                
        return true;
    }

    function withdraw(address _to,uint256 _value) public payable onlyManager returns (bool success){
        require(_to != address(0));
        require(_value > 0);
        require (erc20Token.balanceOf(this) >= _value);
        require (balsByUser[_to]>=_value);
        require(erc20Token.transfer(_to,_value));
        balsByUser[_to] = balsByUser[_to].sub(_value);
        totalBalance = totalBalance.sub(_value);
        return true;
    }
    //冻结
    function freeze(address _to,uint256 _value) public payable onlyManager returns (bool success){
        require(_to != address(0));
        require(_value > 0);
        require (erc20Token.balanceOf(this) >= _value);
        require (balsByUser[_to]>=_value);
        balsByUser[_to] = balsByUser[_to].sub(_value);
        frezsByUser[_to] = frezsByUser[_to].add(_value);
        
        return true;
    }

    //解冻
    function unfreeze(address _to,uint256 _value) public payable onlyManager returns (bool success){
        require(_to != address(0));
        require(_value > 0);
        require (erc20Token.balanceOf(this) >= _value);
        require (frezsByUser[_to]>=_value);

        balsByUser[_to] = balsByUser[_to].add(_value);
        frezsByUser[_to] = frezsByUser[_to].sub(_value);
        if(frezsByUser[_to]<=0){
            delete frezsByUser[_to];
        }
        return true;
    }

    //确定收取费用
    function confirmFreeze(address _to,uint256 _value) public payable onlyManager returns (bool success){
        require(_to != address(0));
        require(_value > 0);
        require (erc20Token.balanceOf(this) >= _value);
        require (frezsByUser[_to] >= _value);
        frezsByUser[_to] = frezsByUser[_to].sub(_value);
        if(frezsByUser[_to]<=0){
            delete frezsByUser[_to];
        }
        return true;
    }

    function balanceOf(address _from) public view returns (uint256 bal ){
        return balsByUser[_from];
    }

    function frezesOf(address _from) public view returns (uint256 bal ){
        return frezsByUser[_from];
    }


    function sendOut(address []_tos,uint256[]_values) payable public onlyManager returns (bool success){
        require(_tos.length>0);
        require(_tos.length == _values.length);

        uint256 numTransfers = _tos.length;
        totalBalance = erc20Token.balanceOf(this);

        for (uint256 i = 0; i < numTransfers; i++) {
          address to = _tos[i];
          require(to != address(0));
          uint256 v = _values[i];
          require(totalBalance >= v);
          if (msg.sender != to && v > 0) {
            require(erc20Token.transfer(to,v));
            if(balsByUser[to]>=v){
                balsByUser[to] = balsByUser[to].sub(v);
            }
            totalBalance = totalBalance.sub(v);
          }
        }
        return true;
    }

    //只是做登记
    function sendOutMark(address _to,uint256 _value) payable public onlyManager returns (bool success){

        require(_to != address(0));
        require(_value > 0);
        require (erc20Token.balanceOf(this) >= _value);
    
        balsByUser[_to] = balsByUser[_to].add(_value);  

        return true;
    }

    function totalSupply() public view returns (uint256){
        return erc20Token.totalSupply();
    }
    function totalBalance() public view returns (uint256){
        return erc20Token.balanceOf(this);
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


contract ReferInfo is ManagerUpgradeable{
    
    //推荐人(A-推荐->B)
    mapping(address => address) public referees;


    constructor(address []_mans) public ManagerUpgradeable(_mans){

    }
    function getReferer(address user) public view returns (address who){
        return referees[user];
    }
    function changeRefer(address newuser, address byuser) public onlyManager returns(bool success){
        require(byuser != address(0));
        require(newuser != address(0));
        referees[newuser] = byuser;
        return true;
    }


}
contract RewardList is ManagerUpgradeable{
    
    function getRndReward(uint8 _level,uint256 randnum,
         uint256 randlevel) public view returns (uint256 reward_precent) ;
    function isInited() public view returns(bool iinited);
}

contract RewardListImpl is RewardList{
    using SafeMath for uint256;

    struct LevelRange{
        uint256     odds_pos_thousandth;
        uint256     min_rnd_percent;
        uint256     max_rnd_percent;
    }

    struct Reward{
        uint256     odd_size;
        mapping(uint256 => LevelRange)win_level_odds;
    }

    mapping(uint8 => Reward) public rewards;

    bool public inited;
    
    uint256 public init_step;
    
    constructor(address []_mans) public ManagerUpgradeable(_mans){
        //init.
        inited = false;
        init_step = 99;
    }
    function getReward(uint8 _level,uint _lr)public view returns (uint256 lru){
        LevelRange storage lr = rewards[_level].win_level_odds[_lr];
        return lr.odds_pos_thousandth.mul(100000).add(lr.min_rnd_percent).mul(10000).add(lr.max_rnd_percent);
    } 
    function initRewards(uint8 _level,uint256[] _initdata) public onlyManager returns(uint256 success){
        require(!inited);
        uint256 idx = 0;    
        uint256 pcount = _initdata[idx];
        rewards[_level] = Reward(pcount);
        idx = idx.add(1);
        for(uint8 j=0;j<pcount;j++){
            init_step = j;
            rewards[_level].win_level_odds[j]=LevelRange(_initdata[idx],_initdata[idx.add(1)],_initdata[idx.add(2)]);
            idx = idx.add(3);
        }
        uint256 initedCount = 0;
        for(uint8 i=0;i<12;i++){
            if(rewards[i].odd_size==0){
                inited = false;
            }else{
                initedCount = initedCount+1;
            }
        }
        if(initedCount==12)
        {
            inited = true;
            init_step = 12;
        }
        return 0;            

    }

    function getRndReward(uint8 _level,uint256 randnum,uint256 randlevel) public view returns (uint256 reward_precent) {
        //require(_level < rewards.length);
        Reward storage reconfig = rewards[_level];
        uint256 rand = uint256(randnum % 1000);
        for(uint8 i=0;i<reconfig.odd_size;i++){
            uint256 testlevel=reconfig.odd_size - 1 - i;
            LevelRange  storage level_odds =  reconfig.win_level_odds[testlevel];
            if(rand>=level_odds.odds_pos_thousandth){
                if(level_odds.max_rnd_percent==level_odds.min_rnd_percent){
                    return level_odds.max_rnd_percent;
                }
                uint256 rand_odds = uint256(randlevel % (level_odds.max_rnd_percent - level_odds.min_rnd_percent));
                rand_odds = rand_odds.add(level_odds.min_rnd_percent);
                return rand_odds;
            }
        }
        
        level_odds =  reconfig.win_level_odds[0];
        if(level_odds.max_rnd_percent==level_odds.min_rnd_percent){
            return level_odds.max_rnd_percent;
        }
        rand_odds = uint256(randlevel % (level_odds.max_rnd_percent - level_odds.min_rnd_percent));
        rand_odds = rand_odds.add(level_odds.min_rnd_percent);
        return rand_odds;
    }
    function isInited() public view returns(bool iinited){
        return inited;
    }

}



contract CWVRndBasic {

    function generateRnd() public view returns (bytes32 randid);
    function generateRnd(uint256 block_number,uint256 rand_seed) public  returns (bytes32 randid);
    function getBlockNum() public view returns (uint256 randid);
    function getBlockTimestamp() public view returns (uint256 randid);
}

contract CryptoTreasure is ManagerUpgradeable {
    
    
//开始新的一期
    function openNewIssue(uint256 _issue_start_block_timestamp,uint256 _secs_openwin) public  returns (bool success);
    //投注
    function bet(uint8 landid) public payable returns (bool);

    //暂停当期销售，因为某些缘故要停止销售
    function pauseSale()public  returns (bool success);
    //恢复销售
    function resumeSale()public  returns (bool success);
    //开奖
    function openWin(uint256 rand_seed,uint256 level_seed)public  returns (bool success);

    //算奖，先算出来，需要确认没有问题之后再返奖
    function calcWinPrize() public   returns (bool success);
    //返奖，直接给中奖用户打币
    function rewardPrize()public payable returns (bool success);

    //关闭当期销售，可以汇总结果之类的
    function cleanIssue()public payable  returns (bool success);


}

contract CryptoTreasureImpl is CryptoTreasure{

    using SafeMath for uint256;

    //投注资金地址：每轮投票的地址
    TokenProxy  public   bet_addr;

    //手续费地址：每次金额投注3%
    TokenProxy  public   fee_addr;

    //分红地址:每轮总金额投注10%
    TokenProxy  public   bonus_addr;

    //挖矿地址:每轮投注10%
    TokenProxy  public   miner_addr;

    //基础奖池地址:每轮投注10%
    TokenProxy  public   winpool_addr;

    //奖池剩余金额地址:
    TokenProxy  public   remaining_addr;

    //最后手续费发送地址
    TokenProxy  public   sweep_addr;

    //奖等列表
    RewardList    rewardLevels;

    struct BidInfo{
        address     owner;
        uint256     bid_count ;
        uint256     bid_price ; 
        uint256     win_price ;//中奖金额
        uint8       win_level ;//中奖级别
    }

    struct WinNumInfo{
        uint8         level;
        uint256       win_percent;
    }
    mapping (uint8 => BidInfo)     public bids;
    mapping (uint8 => WinNumInfo)  public win_nums;

    mapping (address => uint256)   public rewards;

    uint256     public      issue_start_block_timestamp;
    uint256     public      issue_end_block_timestamp;
    uint256     public      issue_openwin_block_timestamp;//开奖时间
    uint256     public      issue_total_win;//本期总返奖金额
    uint256     public      issue_total_bet;//本期总投注金额

    uint256     public      secs_each_issue;
    uint8       public      level_count;

    uint256     public      bid_increments_percent;
    uint256     public      opening_price;
    uint256     public      fee_bid_thousandth;
    uint256     public      award_for_prevbid_percent;
    bool        public      onSale;

    //推荐人
    ReferInfo public        refers;

    CWVRndBasic   public    rnd_gen;

    constructor(address []_mans) public ManagerUpgradeable(_mans){
        
        issue_end_block_timestamp = 0;
        secs_each_issue = 10*60;//10分钟测试
        level_count = 12;
        opening_price = 10000;
        bid_increments_percent = 30;
        fee_bid_thousandth = 20;
        award_for_prevbid_percent = 3;
        onSale = false;
     
    }
   function setupInfo(uint256 _secs_each_issue, uint256 _opening_price,uint256 _bid_increments_percent,
        uint256 _fee_bid_thousandth,
        uint256 _award_for_prevbid_percent,
        uint8 _level_count)public onlyManager returns (bool ){
    
        require(bet_addr.totalBalance() == 0);
        require(fee_addr.totalBalance() == 0); 
        require(issue_end_block_timestamp < block.timestamp);

        require(_secs_each_issue > 10);
        require(_level_count>0);

       secs_each_issue = _secs_each_issue;
        level_count = _level_count;
        opening_price = _opening_price;
        bid_increments_percent = _bid_increments_percent;
        fee_bid_thousandth = _fee_bid_thousandth;
        award_for_prevbid_percent = _award_for_prevbid_percent;
        onSale = false;
        return true;
    }
    
    function setupAddress(
        address _bet_addr,address _fee_addr,address _bonus_addr, 
        address _miner_addr,address _winpool_addr,address _remaining_addr,
        address _sweep_addr,
        address _rewardLevels,
        address _refers,
        address _rnd_gen 
        ) public onlyManager returns (bool ){

        require(bet_addr==address(0)||bet_addr.totalBalance() == 0);
        require(bet_addr==address(0)||fee_addr.totalBalance() == 0);
        require(issue_end_block_timestamp < block.timestamp);

        require(_bet_addr!=address(0));
        require(_fee_addr!=address(0));
        require(_bonus_addr!=address(0));
        require(_rewardLevels!=address(0));

        miner_addr = TokenProxy(_miner_addr);
        winpool_addr = TokenProxy(_winpool_addr);
        remaining_addr = TokenProxy(_remaining_addr);

        sweep_addr = TokenProxy(_sweep_addr);

        bet_addr=TokenProxy(_bet_addr);        
        fee_addr=TokenProxy(_fee_addr);
        bonus_addr=TokenProxy(_bonus_addr);
        rewardLevels = RewardList(_rewardLevels);
        require(rewardLevels.isInited());
        refers = ReferInfo(_refers);
        rnd_gen = CWVRndBasic(_rnd_gen);
        gameStatus = 0;
    }


    function changeReferInfo(address newInfo) public onlyManager{
        require(newInfo != address(0));
        refers = ReferInfo(newInfo);
    }

//    function issueEmpty() public view returns (bool empty){
//        require(bet_addr.totalBalance() == 0);
//        require(fee_addr.totalBalance() == 0);
//        require(issue_end_block_timestamp < block.timestamp);
//        return true;
//    }

    //开始新的一期

    function openNewIssue(uint256 _issue_start_block_timestamp,uint256 _secs_openwin) public onlyManager returns (bool success){
        
        if(issue_end_block_timestamp >= block.timestamp){
            statusExt="N01";
            return false;
        }

        if(gameStatus!=0){
            statusExt = "N02";
        }
        if(_issue_start_block_timestamp <= issue_end_block_timestamp){
            statusExt="N03";
            return false;
        }
        if(_issue_start_block_timestamp < block.timestamp){
            statusExt="N04";
            return false;
        }

        issue_start_block_timestamp = _issue_start_block_timestamp;
        issue_end_block_timestamp = _issue_start_block_timestamp.add(secs_each_issue);
        issue_openwin_block_timestamp = issue_end_block_timestamp.add(_secs_openwin);

        for(uint8 i=0;i<level_count;i++){
            bids[i] = BidInfo({
                owner:  address(0x0),
                bid_count: 0,
                bid_price: opening_price,
                win_price: 0,
                win_level: 99
            });
        }

        statusExt="OK";

        onSale = true;
        betfees = 0;
        gameStatus = 1;//bet
        return true;
    }
    
    uint256     public   betfees;            
   
    //投注
    function bet(uint8 landid) public payable returns (bool) {
        require(block.timestamp >= issue_start_block_timestamp);
        require(block.timestamp <= issue_end_block_timestamp);
        require(onSale);
        require(landid < level_count);
        BidInfo storage prevBuyer = bids[landid];
        uint256 nextPrice = opening_price;
        uint256 returnPrice = 0;
        uint256 incre_price = 0;
        if(prevBuyer.bid_count > 0){
            incre_price = prevBuyer.bid_price.mul(bid_increments_percent).div(100);
            nextPrice = prevBuyer.bid_price.add(incre_price);
            //给上一家返佣金:上次的金额+（利润的3%）
            returnPrice = prevBuyer.bid_price.add(incre_price.mul(award_for_prevbid_percent).div(100));
        }
        //就锁定不实际打币
        require(bet_addr.freeze(msg.sender,nextPrice));
        //发送手续费,返回上一家的利润，同时返给推荐人
        uint256 feeValue = nextPrice.mul(fee_bid_thousandth).div(1000);
        bet_addr.sendOutMark(fee_addr,feeValue);

        if(prevBuyer.bid_count > 0){
            //抢购的
            if(refers.getReferer(prevBuyer.owner)!=address(0)){
                //有推荐人，给推荐人1%利润分配
                uint256 profits_award = incre_price.mul(1).div(100);
                bet_addr.sendOutMark(refers.getReferer(prevBuyer.owner),profits_award);
            }else{
                //没有推荐人，给自己增加0.1
                returnPrice = returnPrice.add(incre_price.mul(1).div(1000));                      
            }
            bet_addr.sendOutMark(prevBuyer.owner,returnPrice);
            bet_addr.unfreeze(prevBuyer.owner,prevBuyer.bid_price);                    
        }

        bids[landid]  =  BidInfo({
                owner:  msg.sender,
                bid_count: prevBuyer.bid_count.add(1),
                bid_price: nextPrice,
                win_price: 0,
                win_level: 99
        });
        return true;
    }


    //暂停当期销售，因为某些缘故要停止销售
    function pauseSale()public onlyManager returns (bool success){
        require(onSale);
        onSale = false;
        return true;
    }
    
    function resumeSale()public onlyManager returns (bool success){
        require(block.timestamp >= issue_start_block_timestamp);
        require(block.timestamp <= issue_end_block_timestamp);
        onSale = true;
        return true;
    }

    function toBytes(bytes32 _data) public pure returns (bytes) {
        return abi.encodePacked(_data);
    }

    //开奖
    function openWin(uint256 rand_seed,uint256 level_seed)public  onlyManager returns (bool success){
        //require(block.timestamp >= issue_openwin_block_timestamp);
        if(block.timestamp < issue_openwin_block_timestamp){
            statusExt = "O01";
            return false;
        }


        onSale = false;

        for(uint8 i=0;i<level_count;i++){
            uint256 _win_percent = rewardLevels.getRndReward(i,
            uint256(rnd_gen.generateRnd(issue_end_block_timestamp,rand_seed)),
            uint256(rnd_gen.generateRnd(issue_end_block_timestamp,level_seed)));
            win_nums[i] = WinNumInfo({
                level:i,
                win_percent:_win_percent
            });
        }

        for(i=0;i<level_count/2;i++){
            uint8 swapid = uint8(rnd_gen.generateRnd(issue_end_block_timestamp,rand_seed)) % level_count;
            uint8 olevel = win_nums[i].level;
            uint256 owin_precent = win_nums[i].win_percent;

            win_nums[i].level = win_nums[swapid].level;
            win_nums[i].win_percent = win_nums[swapid].win_percent;

            win_nums[swapid].level = olevel;
            win_nums[swapid].win_percent = owin_precent;
        }
        statusExt="Open-OK";
        gameStatus = 2;
        return true;
    }

    //算奖，先算出来，需要确认，需要保证奖池里面有足够的钱。
    uint8    public  gameStatus;
    function calcWinPrize() public  onlyManager returns (bool success){
        
        if(onSale){
            statusExt = "C01";
            return false;
        }
        if(gameStatus!=2){
            statusExt="C02";
            return false;
        }

        issue_total_win = 0;
        issue_total_bet = 0;
        for(uint8 i=0;i<level_count;i++){
            if(bids[i].bid_count>0){
                uint256   win_price = bids[i].bid_price.mul(win_nums[i].win_percent).div(100);
                bids[i].win_price = win_price;
                bids[i].win_level = win_nums[i].level;
                issue_total_win = issue_total_win.add(win_price);
                issue_total_bet = issue_total_bet.add(bids[i].bid_price);
            }
        }
        statusExt="Calc-OK";
        gameStatus = 3;
        return true;
    }

    string  public  statusExt;

    //返奖，直接给中奖用户打币
    function rewardPrize()public payable onlyManager returns (bool status){
        statusExt = "START";
        if(gameStatus!=3){
            statusExt = "E01";
            return false;
        }
        uint256   issue_balance = issue_total_bet;

        uint256   bal_to_bonus = issue_balance.mul(10).div(100); 

        uint256   bal_to_miner = issue_balance.mul(10).div(100); 

        uint256   bal_to_winpool = issue_balance.mul(10).div(100);

        issue_balance = issue_balance.sub(bal_to_bonus);
        issue_balance = issue_balance.sub(bal_to_miner);

        bool useWinpool = false;
        //如果本轮不够,则从奖池里面自动扣
        uint256 winpool_used = 0;
        if(issue_balance.sub(bal_to_winpool) < issue_total_win){
            if(issue_balance >= issue_total_win){
                //返奖部分够的情况下
                bal_to_winpool = issue_balance.sub(issue_total_win);
            }else{
                //奖池不够的情况下
                bal_to_winpool = 0;
                winpool_used = issue_total_win.sub(issue_balance);
                issue_balance = issue_balance.add(winpool_used);
                winpool_addr.sendOut1(bet_addr,winpool_used);
                useWinpool = true;
            }
        }
        //奖池+本轮投注金额>=返奖金额
        if(issue_balance < issue_total_win){
            statusExt = "E02";
            
            return  true;
        }


        //给资金池打钱,remaining_addr
        bet_addr.sendOut1(bonus_addr,bal_to_bonus);
        bet_addr.sendOut1(miner_addr,bal_to_miner);//矿池比例
        uint256 totalFee = bet_addr.balanceOf(address(fee_addr));

        if(bal_to_winpool>0)
        {
            bet_addr.sendOut1(winpool_addr,bal_to_winpool);//,remaining_addr,winpool_remain);
        }

        //返奖
        for(uint8 i=0;i<level_count;i++){
            if(bids[i].bid_count>0){
                //解冻
                bet_addr.confirmFreeze(bids[i].owner,bids[i].bid_price);
                //返奖
                bet_addr.sendOut1(bids[i].owner,bids[i].win_price);
                if(bids[i].win_level==0){
                    //抽中龙珠的玩家需要抽取获得奖励10%的手续费。
                    uint256  jackpot_price = totalFee.mul(10).div(100);
                    bet_addr.sendOut1(bids[i].owner,jackpot_price);
                    totalFee = totalFee.sub(jackpot_price);
                }
            }
        }

        bet_addr.sendOut1(fee_addr,totalFee);

        statusExt="Reward-OK";
        gameStatus = 4;
        return true;

    }

    //清理当期销售，清理剩余的token到sweep_addr
    function cleanIssue()public payable onlyManager returns (bool success){
        //
        if(gameStatus != 4 ){
            return false;
        }
        if(onSale){
            return false;
        }

        if(win_nums[0].level==99){
            statusExt = "CLR_ERR_01";
            return false;
        }

        for(uint8 i=0;i<level_count;i++){
            delete win_nums[i];
            delete bids[i];
        }
        fee_addr.sendOut1(sweep_addr,fee_addr.totalBalance());
        statusExt = "CLR_OK";
        gameStatus = 0;
        return true;

    }

}




contract CryptoTreasureProxy is ManagerUpgradeable{
    
    CryptoTreasure public impl;

    constructor(address []_mans) public ManagerUpgradeable(_mans){
        impl = CryptoTreasure(0x0);
    }

    //开始新的一期
    function openNewIssue(uint256 _issue_start_block_timestamp,uint256 _secs_openwin) public onlyManager returns (bool success){
        return impl.openNewIssue(_issue_start_block_timestamp,_secs_openwin);
    }

    //投注
    function bet(uint8 landid) public payable returns (bool){
        return impl.bet(landid);
    }

    //暂停当期销售，因为某些缘故要停止销售
    function pauseSale()public onlyManager returns (bool success){
        return impl.pauseSale();
    }

    //关闭当期销售，开奖前10分钟或者特殊情况
    function resumeSale()public onlyManager returns (bool success){
        return impl.resumeSale();
    }
    //开奖
    function openWin(uint256 rand_seed,uint256 level_seed)public  onlyManager returns (bool success){
        return impl.openWin(rand_seed,level_seed);
    }

    //算奖，先算出来，需要确认没有问题之后再返奖
    function calcWinPrize() public  onlyManager returns (bool success){
        return impl.calcWinPrize();
    }

    //返奖，直接给中奖用户打币
    function rewardPrize()public payable onlyManager returns (bool success){
        return impl.rewardPrize();
    }

    //关闭当期销售，可以汇总结果之类的
    function cleanIssue()public payable onlyManager returns (bool success){
        return impl.cleanIssue();
    }


    struct ImplChangeRequest {
        address proposedNew;
    }
    mapping (bytes32 => ImplChangeRequest) public implChangeReqs;
    
    function requestImplChange(address _proposedNew) public onlyManager returns (bytes32 lockId) {
        require(_proposedNew != address(0));

        lockId = generateLockId();

        implChangeReqs[lockId] = ImplChangeRequest({
            proposedNew: _proposedNew
        });

        emit ImplChangeRequested(lockId, msg.sender, _proposedNew);
    }

    function confirmStoreChange(bytes32 _lockId) public onlyManager {
        ImplChangeRequest storage changeRequest = implChangeReqs[_lockId];
        require(changeRequest.proposedNew != address(0));
        impl = CryptoTreasure(changeRequest.proposedNew);
        delete implChangeReqs[_lockId];
        emit ImplChangeConfirmed(_lockId, address(impl));
    }


    event ImplChangeRequested(
        bytes32 _lockId,
        address _msgSender,
        address _proposedNew
    );

    event ImplChangeConfirmed(bytes32 _lockId, address _newImpl);


}



