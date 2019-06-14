const EmbarkJS = require('Embark/EmbarkJS');
const Utils = require('../utils/testUtils');
const MiniMeToken = require('Embark/contracts/MiniMeToken');
const TestStatusNetwork = require('Embark/contracts/TestStatusNetwork');
const StickerMarket = require('Embark/contracts/StickerMarket');
const StickerPack = require('Embark/contracts/StickerPack');
const StickerType = require('Embark/contracts/StickerType');
const StickerMarketMigrated = require('Embark/contracts/StickerMarketMigrated');

config({
  contracts: {
    "MiniMeTokenFactory": {},
    "MiniMeToken": {
      "args":["$MiniMeTokenFactory", "0x0", "0x0", "Status Test Token", 18, "STT", true],
    },
    "TestStatusNetwork": {
      "args": ["0x0", "$MiniMeToken"],
      "onDeploy": [
        "await MiniMeToken.methods.changeController(TestStatusNetwork.address).send()",
        "await TestStatusNetwork.methods.setOpen(true).send()",
      ]
    },
    "StickerMarket": {
        "args": ["$MiniMeToken", "0x0", "0x0"]
    },
    "StickerMarketMigrated": {
        "args": ["$StickerMarket"]
    }
  }
});

contract("StickerMarket", function() {
    this.timeout(0);
    var accounts;
    var testPacks;
    var stickerPack;
    var stickerType;
    var registerFee = "0";
    let registeredPacks = [];
    
    before(async function() {
        accounts = await web3.eth.getAccounts();
        stickerPack = new EmbarkJS.Blockchain.Contract({ 
            abi: StickerPack._jsonInterface, 
            address: await StickerMarket.methods.stickerPack().call() 
        });
        stickerType = new EmbarkJS.Blockchain.Contract({
            abi: StickerType._jsonInterface,
            address: await StickerMarket.methods.stickerType().call() 
        });
        testPacks = [
            {
                category: ["0x00000000", "0x00000001","0x00000002","0x00000003","0x00000004"],
                price: "10000000000000000000",
                donate: "0",
                contentHash:"0x55c72bf3b3d468c7c36c848a4d49bb11101dc79bc2f6484bf1ef796fc498919a",
                owner: accounts[1]
            },
            {
                category: ["0x00000000", "0x00000001"],
                price: "10000000000000000000",
                donate: "10",
                contentHash:"0xe434491f185cedfea522bd0b937ce849906833aefa20a76e8e50db194baf34cb",
                owner: accounts[2]
            },
            {
                category: ["0x00000000", "0x00000001","0x00000002","0x00000004"],
                price: "10000000000000000000",
                donate: "100",
                contentHash:"0xf4c247e858aba2942bf0ed6008c15a387c88c262c70f930ab91799655d71367d",
                owner: accounts[3]
            },
            {
                category: ["0x00000000", "0x00000002","0x00000003","0x00000004"],
                price: "10000000000000000000",
                donate: "1000",
                contentHash:"0x66c2aec914d17249c66a750303521a51607c38d084ae173976e54ad40473d056",
                owner: accounts[4]
            },
            {
                category: ["0x00000000", "0x00000001","0x00000002","0x00000004"],
                price: "10000000000000000000",
                donate: "10000",
                contentHash:"0x4e25277a1af127bd1c2fce6aa20ac7eae8fded9c615b7964ebe9e18779765108",
                owner: accounts[5]
            },
            {
                category: ["0x00000000", "0x00000004"],
                price: "10000000000000000000",
                donate: "2",
                contentHash:"0x659c423e40fc2b4f37ada1dda463aa4455d650d799d82e63af87ac8b714bee66",
                owner: accounts[6]
            },
            {
                category: ["0x00000000", "0x00000003","0x00000004"],
                price: "10000000000000000000",
                donate: "20",
                contentHash:"0xbbf932b8a154bc1d496ebbfa2acca571119d53a6cb5986d8a187e85ac8a37265",
                owner: accounts[7]
            },
            {
                category: ["0x00000000", "0x00000003"],
                price: "10000000000000000000",
                donate: "200",
                contentHash:"0x6dd4cbc4a86825506bf85defa071a4e6ac5d76a1b6912863ef0e289327df08d2",
                owner: accounts[8]
            }
        ];
    });

    it("should register packs", async function() {

        for(let i = 0; i < testPacks.length; i++){
            let pack = testPacks[i];
            let reg = await StickerMarket.methods.registerPack(pack.price, pack.donate, pack.category, pack.owner, pack.contentHash, registerFee).send();    
            registeredPacks.push({id: reg.events.Register.returnValues.packId, data: pack})
        };
        for(let i = 0; i < registeredPacks.length; i++){
            for(let j = 0; j < registeredPacks[i].data.category.length; j++) {
                let r = await stickerType.methods.getAvailablePacks(registeredPacks[i].data.category[j]).call();
                assert.notEqual(r.indexOf(registeredPacks[i].id), -1);    
            }
        }
    });

    it("should mint packs", async function() {
        let burnRate = 10;
        await StickerMarket.methods.setBurnRate(burnRate).send();
        let packBuyer = accounts[2];
        for(let i = 0; i < registeredPacks.length; i++){
            await TestStatusNetwork.methods.mint(registeredPacks[i].data.price).send({from: packBuyer });
            await MiniMeToken.methods.approve(StickerMarket.address, registeredPacks[i].data.price).send({from: packBuyer });
            let buy = await StickerMarket.methods.buyToken(registeredPacks[i].id, packBuyer, registeredPacks[i].data.price).send({from: packBuyer });
            let tokenId;
            let toArtist = 0;
            let donated = 0;
            let burned = 0;
            let burnAddress =(await MiniMeToken.methods.controller().call());
            let controller = accounts[0];
            for(let j = 0; j < buy.events.Transfer.length; j++) {
                if(buy.events.Transfer[j].address == MiniMeToken.address){
                    if(buy.events.Transfer[j].returnValues.to == controller){
                        donated = buy.events.Transfer[j].returnValues.value;
                    }else if(buy.events.Transfer[j].returnValues.to == registeredPacks[i].data.owner){
                        toArtist = buy.events.Transfer[j].returnValues.value;
                    }else if(buy.events.Transfer[j].returnValues.to == burnAddress){
                        burned = buy.events.Transfer[j].returnValues.value;
                    }
                }else if(buy.events.Transfer[j].address == stickerPack.address){
                    tokenId = buy.events.Transfer[j].returnValues.value;
                }
            }


            assert.equal(registeredPacks[i].data.price, (+toArtist + +donated + +burned))
            assert.equal(burned, (registeredPacks[i].data.price * burnRate) / 10000, "Bad burn") 
            assert.equal(donated, ((+registeredPacks[i].data.price - burned) * registeredPacks[i].data.donate)/10000, "Bad donate")
            assert.equal(toArtist, registeredPacks[i].data.price - (+donated + +burned), "Bad profit")
            assert.equal(await stickerPack.methods.ownerOf(tokenId).call(), packBuyer, "Bad owner")
            
        }
    });

    it("should mint packs with approveAndCall", async function() {
        let burnRate = 10;
        await StickerMarket.methods.setBurnRate(burnRate).send();
        let packBuyer = accounts[2];
        for(let i = 0; i < registeredPacks.length; i++){
            
            await TestStatusNetwork.methods.mint(registeredPacks[i].data.price).send({from: packBuyer });
            const buyCall = StickerMarket.methods.buyToken(registeredPacks[i].id, packBuyer, registeredPacks[i].data.price).encodeABI();
            let buy = await MiniMeToken.methods.approveAndCall(StickerMarket.address, registeredPacks[i].data.price, buyCall).send({from: packBuyer });
            let tokenId;
            let toArtist = 0;
            let donated = 0;
            let burned = 0;
            let burnAddress =(await MiniMeToken.methods.controller().call());
            let controller = accounts[0];``
            for(let j = 0; j < buy.events.Transfer.length; j++) {
                if(buy.events.Transfer[j].address == MiniMeToken.address){
                    if(buy.events.Transfer[j].returnValues.to == controller){
                        donated = buy.events.Transfer[j].returnValues.value
                    }else if(buy.events.Transfer[j].returnValues.to == registeredPacks[i].data.owner){
                        toArtist = buy.events.Transfer[j].returnValues.value
                    }else if(buy.events.Transfer[j].returnValues.to == burnAddress){
                        burned = buy.events.Transfer[j].returnValues.value
                    }
                }else if(buy.events.Transfer[j].address == stickerPack.address){
                    tokenId = buy.events.Transfer[j].returnValues.value;
                }
            }

            assert.equal(registeredPacks[i].data.price, (+toArtist + +donated + +burned), "Bad payment")
            assert.equal(burned, (registeredPacks[i].data.price * burnRate) / 10000, "Bad burn") 
            assert.equal(donated, ((+registeredPacks[i].data.price - burned) * registeredPacks[i].data.donate)/10000, "Bad donate")
            assert.equal(toArtist, registeredPacks[i].data.price - (+donated + +burned), "Bad profit")
            assert.equal(await stickerPack.methods.ownerOf(tokenId).call(), packBuyer, "Bad owner")
            
        }
    });

    it("should register pack with approveAndCall", async function() {
        registerFee = "1000000000000000000";
        await StickerMarket.methods.setRegisterFee(registerFee).send();
        await TestStatusNetwork.methods.mint(registerFee).send();
        let pack = testPacks[0];
        let regCall = await StickerMarket.methods.registerPack(pack.price, pack.donate, pack.category, pack.owner, pack.contentHash, registerFee).encodeABI();  
        let packId = await stickerType.methods.packCount().call();
        let reg = await MiniMeToken.methods.approveAndCall(StickerMarket.address, registerFee, regCall).send();  
        
        for(let j = 0; j < pack.category.length; j++) {
            assert.notEqual((await stickerType.methods.getAvailablePacks(pack.category[j]).call()).indexOf(packId), -1);    
        }

        await StickerMarket.methods.purgePack(packId, 0).send();  
    });

    it("should purge packs", async function() {
        var i = 0;
        await StickerMarket.methods.purgePack(registeredPacks[i].id, 0).send();  
        for(let j = 0; j < registeredPacks[i].data.category.length; j++) {
            assert.equal((await stickerType.methods.getAvailablePacks(registeredPacks[i].data.category[j]).call()).indexOf(registeredPacks[i].id), -1);    
        }

        i = registeredPacks.length-1;
        await StickerMarket.methods.purgePack(registeredPacks[i].id, 0).send();  
        for(let j = 0; j < registeredPacks[i].data.category.length; j++) {
            assert.equal((await stickerType.methods.getAvailablePacks(registeredPacks[i].data.category[j]).call()).indexOf(registeredPacks[i].id), -1);    
        }

        i = 2;
        await StickerMarket.methods.purgePack(registeredPacks[i].id, 0).send();  
        for(let j = 0; j < registeredPacks[i].data.category.length; j++) {
            assert.equal((await stickerType.methods.getAvailablePacks(registeredPacks[i].data.category[j]).call()).indexOf(registeredPacks[i].id), -1);    
        }

    });

    it("should not mint a pack with price 0", async function() {
        registerFee = "0";
        await StickerMarket.methods.setRegisterFee(registerFee).send();
        let testPack = "0x0000000000000000000000000000000000000000000000000000000000000000";
        let testPackPrice = "0";
        let packOwner = accounts[1];
        let packBuyer = accounts[2];
        let reg = await StickerMarket.methods.registerPack(testPackPrice, 0, ["0x00000000"], packOwner, testPack, registerFee).send();
        let packId = reg.events.Register.returnValues.packId;
        await TestStatusNetwork.methods.mint("1").send({from: packBuyer });
        await MiniMeToken.methods.approve(StickerMarket.address, "1").send({from: packBuyer });
        Utils.expectThrow(StickerMarket.methods.buyToken(packId, packBuyer, testPackPrice).send({from: packBuyer }));
        await StickerMarket.methods.purgePack(packId, 0).send();  
    });

    it("should migrate", async function() {
        await StickerMarket.methods.setMarketState(3).send();
        await StickerMarket.methods.migrate(StickerMarketMigrated.options.address).send();

        let testPack = "0x0000000000000000000000000000000000000000000000000000000000000000";
        let testPackPrice = "0";
        let packOwner = accounts[1];
        let packBuyer = accounts[2];
        let reg = await StickerMarketMigrated.methods.registerPack(testPackPrice, 0, ["0x00000000"], packOwner, testPack, registerFee).send();
        let packId = reg.events.Register.returnValues.packId;
        await TestStatusNetwork.methods.mint("1").send({from: packBuyer });
        await StickerMarketMigrated.methods.buyToken(packId, packBuyer, testPackPrice).send({from: packBuyer });
        await StickerMarketMigrated.methods.purgePack(packId, 0).send();  
    });

});
