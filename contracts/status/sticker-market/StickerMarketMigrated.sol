pragma solidity >=0.5.0 <0.6.0;

import "./StickerMarket.sol";


/**
 * @author Ricardo Guilherme Schmidt (Status Research & Development GmbH)
 * StickerMarket allows any address register "StickerPack" which can be sold to any address in form of "StickerPack", an ERC721 token.
 */
contract StickerMarketMigrated is StickerMarket {

    /**
     * @param _migrating version moving from
     */
    constructor(
        StickerMarket _migrating
    )
        public
        StickerMarket(
            _migrating.snt(),
            _migrating.stickerPack(),
            _migrating.stickerType()
        )
    {

    }

    /**
     * @dev transfer SNT from buyer to pack owner and mint sticker pack token
     * @param _caller payment account
     * @param _packId id of market pack
     * @param _destination owner of token being brought
     * @param _price agreed price
     * @return created tokenId
     */
    function buy(
        address _caller,
        uint256 _packId,
        address _destination,
        uint256 _price
    )
        internal
        marketSell
        returns (uint256 tokenId)
    {
        (
            address pack_owner,
            bool pack_mintable,
            uint256 pack_price,
            uint256 pack_donate
        ) = stickerType.getPaymentData(_packId);
        require(pack_owner != address(0), "Bad pack");
        require(pack_mintable, "Disabled");
        uint256 amount = pack_price;
        require(_price == amount, "Wrong price");
        if(amount > 0 && burnRate > 0) {
            uint256 burned = amount.mul(burnRate).div(10000);
            amount = amount.sub(burned);
            require(snt.transferFrom(_caller, Controlled(address(snt)).controller(), burned), "Bad burn");
        }
        if(amount > 0 && pack_donate > 0) {
            uint256 donate = amount.mul(pack_donate).div(10000);
            amount = amount.sub(donate);
            require(snt.transferFrom(_caller, controller, donate), "Bad donate");
        }
        if(amount > 0) {
            require(snt.transferFrom(_caller, pack_owner, amount), "Bad payment");
        }
        return stickerPack.generateToken(_destination, _packId);
    }


}