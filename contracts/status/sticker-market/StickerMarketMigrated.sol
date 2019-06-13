pragma solidity >=0.5.0 <0.6.0;

import "./StickerMarket.sol";
import "../../token/ERC20Token.sol";
import "../../token/ApproveAndCallFallBack.sol";
import "../../common/Controlled.sol";
import "../../common/TokenClaimer.sol";

/**
 * @author Ricardo Guilherme Schmidt (Status Research & Development GmbH) 
 * StickerMarket allows any address register "StickerPack" which can be sold to any address in form of "StickerPack", an ERC721 token.
 */
contract StickerMarketMigrated is Controlled, TokenClaimer, ApproveAndCallFallBack {
    event Register(uint256 indexed packId, uint256 dataPrice, bytes _contenthash);
    event Categorized(bytes4 indexed category, uint256 indexed packId);
    event Uncategorized(bytes4 indexed category, uint256 indexed packId);
    event Unregister(uint256 indexed packId);
    event ClaimedTokens(address indexed _token, address indexed _controller, uint256 _amount);
    event MarketState(State state);
    event RegisterFee(uint256 value);
    event BurnRate(uint256 value);

    enum State { Invalid, Open, BuyOnly, Controlled, Closed }

    State public state = State.Open;
    uint256 registerFee;
    uint256 burnRate;
    
    //include global var to set burn rate/percentage
    ERC20Token public snt; //payment token
    StickerMarket public registry;

    /**
     * @dev can only be called when market is open
     */
    modifier marketManagement {
        require(state == State.Open || (msg.sender == controller && state == State.Controlled), "Market Disabled");
        _;
    }

    /**
     * @dev can only be called when market is open
     */
    modifier marketSell {
        require(state == State.Open || state == State.BuyOnly || (msg.sender == controller && state == State.Controlled), "Market Disabled");
        _;
    }

    modifier packOwner(uint256 _packId) {
        require(msg.sender == controller || registry.isPackOwner(_packId, msg.sender));
        _;
    }

    /**
     * @param _snt SNT token
     */
    constructor(
        ERC20Token _snt,
        StickerMarket _registry
    ) 
        public
    { 
        snt = _snt;
        registry = _registry;
    }

    /** 
     * @dev Mints registry StickerPack in `msg.sender` account, and Transfers SNT using user allowance
     * emit NonfungibleToken.Transfer(`address(0)`, `msg.sender`, `tokenId`)
     * @notice buy a pack from market pack owner, including a StickerPack's token in msg.sender account with same metadata of `_packId` 
     * @param _packId id of market pack 
     * @param _destination owner of token being brought
     * @return tokenId generated StickerPack token 
     */
    function buyToken(
        uint256 _packId,
        address _destination
    ) 
        external  
        returns (uint256 tokenId)
    {
        return buy(msg.sender, _packId, _destination);
    }

    /** 
     * @dev emits StickerMarket.Register(`packId`, `_urlHash`, `_price`, `_contenthash`)
     * @notice Registers to sell a sticker pack 
     * @param _price cost in wei to users minting with _urlHash metadata
     * @param _donate optional amount of `_price` that is donated to StickerMarket at every buy
     * @param _category listing category
     * @param _owner address of the beneficiary of buys
     * @param _contenthash EIP1577 pack contenthash for listings
     * @return packId Market position of Sticker Pack data.
     */
    function registerPack(
        uint256 _price,
        uint256 _donate,
        bytes4[] calldata _category, 
        address _owner,
        bytes calldata _contenthash
    ) 
        external  
        returns(uint256 packId)
    {
        packId = register(msg.sender, _category, _owner, _price, _donate, _contenthash);
    }

    /**
     * @notice changes beneficiary of `_packId`, can only be called when market is open
     * @param _packId which market position is being transfered
     * @param _to new beneficiary
     */
    function setPackOwner(uint256 _packId, address _to) 
        external 
        marketManagement 
        packOwner(_packId)
    {
        registry.setPackOwner(_packId, _to);
    }

    /**
     * @notice changes price of `_packId`, can only be called when market is open
     * @param _packId which market position is being transfered
     * @param _price new value
     */
    function setPackPrice(uint256 _packId, uint256 _price, uint256 _donate) 
        external 
        marketManagement 
        packOwner(_packId)
    {
        registry.setPackPrice(_packId, _price, _donate);
    }

    /**
     * @notice changes caregory of `_packId`, can only be called when market is open
     * @param _packId which market position is being transfered
     * @param _category new category
     */

    function addPackCategory(uint256 _packId, bytes4 _category)
        external 
        marketManagement 
        packOwner(_packId)
    {
        registry.addPackCategory(_packId, _category);
    }

    /**
     * @notice changes caregory of `_packId`, can only be called when market is open
     * @param _packId which market position is being transfered
     * @param _category category to unlist
     */

    function removePackCategory(uint256 _packId, bytes4 _category)
        external 
        marketManagement 
        packOwner(_packId)
    {
        registry.removePackCategory(_packId, _category);
    }
    
    /**
     * @notice 
     * @param _packId position edit
     */
    function setPackState(uint256 _packId, bool _mintable) 
        external 
        marketManagement 
        packOwner(_packId)
    {
        registry.setPackState(_packId,_mintable);
    }

    /**
     * @notice MiniMeToken ApproveAndCallFallBack forwarder for registerPack and buyToken
     * @param _from account calling "approve and buy" 
     * @param _token must be exactly SNT contract
     * @param _data abi encoded call 
     */
    function receiveApproval(
        address _from,
        uint256,
        address _token,
        bytes calldata _data
    ) 
        external 
    {
        require(_token == address(snt), "Bad token");
        require(_token == address(msg.sender), "Bad call");
        bytes4 sig = abiDecodeSig(_data);
        bytes memory cdata = slice(_data,4,_data.length-4);
        if(sig == bytes4(keccak256("buyToken(uint256,address)"))){
            require(cdata.length == 64, "Bad data length");
            (uint256 packId, address owner) = abi.decode(cdata, (uint256, address));
            buy(_from, packId, owner);
        } else if(sig == bytes4(keccak256("registerPack(uint256,uint256,bytes4[],address,bytes)"))) {
            require(cdata.length >= 156, "Bad data length");
            (uint256 _price, uint256 _donate, bytes4[] memory _category, address _owner, bytes memory _contenthash) = abi.decode(cdata, (uint256,uint256,bytes4[],address,bytes));
            register(_from, _category, _owner, _price, _donate, _contenthash);
        } else {
            revert("Bad call");
        }
    }

    /**
     * @notice changes contenthash of `_packId`, can only be called by controller
     * @param _packId which market position is being altered
     * @param _contenthash new contenthash
     */
    function setPackContenthash(uint256 _packId, bytes calldata _contenthash) 
        external 
        onlyController 
    {
        registry.setPackContenthash(_packId, _contenthash);
    }
    
    /**
     * @notice removes all market data about a marketed pack, can only be called by listing owner or market controller, and when market is open
     * @param _packId position to be deleted
     */
    function purgePack(uint256 _packId, uint256 _limit)
        external
        onlyController 
    {
        registry.purgePack(_packId, _limit);
    }

    /**
     * @notice changes market state, only controller can call.
     * @param _state new state
     */
    function setMarketState(State _state)
        external
        onlyController 
    {
        state = _state;
        emit MarketState(_state);
    }

    /**
     * @notice changes register fee, only controller can call.
     * @param _value new register fee
     */
    function setRegisterFee(uint256 _value)
        external
        onlyController 
    {
        registerFee = _value;
        emit RegisterFee(_value);
    }

        /**
     * @notice changes burn rate, only controller can call.
     * @param _value new burn rate
     */
    function setBurnRate(uint256 _value)
        external
        onlyController 
    {
        burnRate = _value;
        require(_value <= 10000, "cannot be more then 100.00%");
        emit BurnRate(_value);
    }

    /**
     * @notice controller can generate tokens at will
     * @param _owner account being included new token
     * @param _packId pack being minted
     * @return tokenId created
     */
    function generateToken(address _owner, uint256 _packId) 
        external
        onlyController 
        returns (uint256 tokenId)
    {
        return registry.generateToken(_owner, _packId);
    }

    /** 
     * @notice controller can generate packs at will
     * @param _price cost in wei to users minting with _urlHash metadata
     * @param _donate optional amount of `_price` that is donated to StickerMarket at every buy
     * @param _category listing category
     * @param _owner address of the beneficiary of buys
     * @param _contenthash EIP1577 pack contenthash for listings
     * @return packId Market position of Sticker Pack data.
     */
    function generatePack(
        uint256 _price,
        uint256 _donate,
        bytes4[] calldata _category, 
        address _owner,
        bytes calldata _contenthash
    ) 
        external  
        onlyController
        returns(uint256 packId)
    {
        return registry.generatePack(_price, _donate, _category, _owner, _contenthash);
    }

    /**
     * @notice Change controller of registry
     * @param _newController new controller of registry.
     */
    function migrateRegisty(address payable _newController) 
        external
        onlyController 
    {
        require(_newController != address(0), "Cannot unset controller");
        registry.changeController(_newController);
    }

    /**
     * @notice This method can be used by the controller to extract mistakenly
     *  sent tokens to this contract.
     * @param _token The address of the token contract that you want to recover
     *  set to 0 in case you want to extract ether.
     */
    function claimTokens(address _token)
        external
        onlyController
    {
        withdrawBalance(_token, controller);
    }

    
    
    /**
     * @notice read available market ids in a category (might be slow)
     * @return array of market id registered
     */
    function getAvailablePacks(bytes4 _category) 
        external 
        view 
        returns (uint256[] memory availableIds)
    {
        return registry.getAvailablePacks(_category);
    }

    /**
     * @notice count total packs in a category
     * @return lenght
     */
    function getCategoryLength(bytes4 _category) 
        external 
        view 
        returns (uint256 size)
    {
        size = registry.getCategoryLength(_category);
    }

    /**
     * @notice read packId of a category index
     * @return packId
     */
    function getCategoryPack(bytes4 _category, uint256 _index) 
        external 
        view 
        returns (uint256 packId)
    {
        packId = registry.getCategoryPack(_category,_index);
    }
    
    /**
     * @notice returns all data from pack in market
     */
    function getPackData(uint256 _packId) 
        external 
        view 
        returns (
            bytes4[] memory category,
            address owner,
            bool mintable,
            uint256 timestamp,
            uint256 price,
            bytes memory contenthash
        ) 
    {
        return registry.getPackData(_packId);
    }

    /**
     * @notice returns relevant token data
     */
    function getTokenData(uint256 _tokenId) 
        external 
        view 
        returns (
            bytes4[] memory category,
            uint256 timestamp,
            bytes memory contenthash
        ) 
    {
        return registry.getTokenData(_tokenId);
    }

    /** 
     * @dev register new pack to owner
     */
    function register(
        address _caller,
        bytes4[] memory _category,
        address _owner,
        uint256 _price,
        uint256 _donate,
        bytes memory _contenthash
    ) 
        internal 
        marketManagement
        returns(uint256 packId) 
    {
        if(registerFee > 0){
            require(snt.transferFrom(_caller, address(this), registerFee), "Bad payment");
        }
        require(_donate <= 10000, "Bad argument, _donate cannot be more then 100.00%");
        return registry.generatePack(_price, _donate, _category, _owner, _contenthash);
    }
    
    /** 
     * @dev transfer SNT from buyer to pack owner and mint sticker pack token 
     */
    function buy(
        address _caller,
        uint256 _packId,
        address _destination
    ) 
        internal 
        marketSell
        returns (uint256 tokenId)
    {
        (
            address owner,
            bool mintable,
            uint256 price,
            uint256 donate
        ) = registry.getPaymentData(_packId);
        require(owner != address(0), "Bad pack");
        require(mintable, "Disabled");
        uint256 amount = price;
        if(amount > 0 && burnRate > 0) {
            uint256 burned = (amount * burnRate) / 10000;
            amount -= burned;
            require(snt.transferFrom(_caller, Controlled(address(snt)).controller(), burned), "Bad burn");
        }
        if(amount > 0 && donate > 0) {
            donate = (amount * donate) / 10000;
            amount -= donate;
            require(snt.transferFrom(_caller, address(this), donate), "Bad donate");
        } 
        if(amount > 0) {
            require(snt.transferFrom(_caller, owner, amount), "Bad payment");
        }
        return registry.generateToken(_destination, _packId);
    }
    
    
    /** 
     * @dev adds id from "available list" 
     */
    function addAvailablePack(uint256 _packId, bytes4 _category) private {
        registry.addPackCategory(_packId,_category);
    }
    
    /** 
     * @dev remove id from "available list" 
     */
    function removeAvailablePack(uint256 _packId, bytes4 _category) private {
        registry.removePackCategory(_packId,_category);
    }



    function abiDecodeSig(bytes memory _data) private pure returns(bytes4 sig){
        assembly {
            sig := mload(add(_data, add(0x20, 0)))
        }
    }

    function slice(bytes memory _bytes, uint _start, uint _length) private pure returns (bytes memory) {
        require(_bytes.length >= (_start + _length));

        bytes memory tempBytes;

        assembly {
            switch iszero(_length)
            case 0 {
                // Get a location of some free memory and store it in tempBytes as
                // Solidity does for memory variables.
                tempBytes := mload(0x40)

                // The first word of the slice result is potentially a partial
                // word read from the original array. To read it, we calculate
                // the length of that partial word and start copying that many
                // bytes into the array. The first word we copy will start with
                // data we don't care about, but the last `lengthmod` bytes will
                // land at the beginning of the contents of the new array. When
                // we're done copying, we overwrite the full first word with
                // the actual length of the slice.
                let lengthmod := and(_length, 31)

                // The multiplication in the next line is necessary
                // because when slicing multiples of 32 bytes (lengthmod == 0)
                // the following copy loop was copying the origin's length
                // and then ending prematurely not copying everything it should.
                let mc := add(add(tempBytes, lengthmod), mul(0x20, iszero(lengthmod)))
                let end := add(mc, _length)

                for {
                    // The multiplication in the next line has the same exact purpose
                    // as the one above.
                    let cc := add(add(add(_bytes, lengthmod), mul(0x20, iszero(lengthmod))), _start)
                } lt(mc, end) {
                    mc := add(mc, 0x20)
                    cc := add(cc, 0x20)
                } {
                    mstore(mc, mload(cc))
                }

                mstore(tempBytes, _length)

                //update free-memory pointer
                //allocating the array padded to 32 bytes like the compiler does now
                mstore(0x40, and(add(mc, 31), not(31)))
            }
            //if we want a zero-length slice let's just return a zero-length array
            default {
                tempBytes := mload(0x40)

                mstore(0x40, add(tempBytes, 0x20))
            }
        }

        return tempBytes;
    }


}