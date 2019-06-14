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
    "StickerType": {
        "args": []
    }
  }
});

contract("StickerType", function() {
    this.timeout(0);
    var accounts;
    var testPacks;
    let registeredPacks = [];
    
    before(function(done) {
        web3.eth.getAccounts().then(function (res) {
            accounts = res;
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
            done();
        });
    });

    it("should register packs", async function() {
        for(let i = 0; i < testPacks.length; i++){
            let pack = testPacks[i];
            let reg = await StickerType.methods.generatePack(pack.price, pack.donate, pack.category, pack.owner, pack.contentHash).send();    
            registeredPacks.push({id: reg.events.Register.returnValues.packId, data: pack})
        };
        for(let i = 0; i < registeredPacks.length; i++){
            for(let j = 0; j < registeredPacks[i].data.category.length; j++) {
                let r = await StickerType.methods.getAvailablePacks(registeredPacks[i].data.category[j]).call();
                assert.notEqual(r.indexOf(registeredPacks[i].id), -1);    
            }
        }
    });

    it("should categorize packs", async function() {
        for(let i = 0; i < registeredPacks.length; i++){
            assert.equal((await StickerType.methods.getPackData(registeredPacks[i].id).call()).category.indexOf("0x12345678"),-1);
            assert.equal((await StickerType.methods.getAvailablePacks("0x12345678").call()).indexOf(registeredPacks[i].id), -1);
            await StickerType.methods.addPackCategory(registeredPacks[i].id, "0x12345678").send({from: testPacks[i].owner});
            assert.notEqual((await StickerType.methods.getPackData(registeredPacks[i].id).call()).category.indexOf("0x12345678"),-1);
            assert.notEqual((await StickerType.methods.getAvailablePacks("0x12345678").call()).indexOf(registeredPacks[i].id), -1);
            registeredPacks[i].data.category.push("0x12345678")
        };
        
    });

    it("should uncategorize packs", async function() {
        for(let i = 0; i < testPacks.length; i++){
            assert.notEqual((await StickerType.methods.getAvailablePacks("0x00000000").call()).indexOf(registeredPacks[i].id), -1);
            assert.notEqual((await StickerType.methods.getPackData(registeredPacks[i].id).call()).category.indexOf("0x00000000"),-1);
            await StickerType.methods.removePackCategory(i, "0x00000000").send({from: testPacks[i].owner});
            assert.equal((await StickerType.methods.getAvailablePacks("0x00000000").call()).indexOf(registeredPacks[i].id), -1);
            assert.equal((await StickerType.methods.getPackData(registeredPacks[i].id).call()).category.indexOf("0x00000000"),-1);
            registeredPacks[i].data.category = registeredPacks[i].data.category.filter(function(value, index, arr){
                return value != "0x00000000";           
            });
        };
        
    });

    it("should change ownership of pack by user", async function() {;
        let testPack = "0x0000000000000000000000000000000000000000000000000000000000000000";
        let testPackPrice = "0";
        let packOwner = accounts[1];
        let packOwner2 = accounts[2];
        let reg = await StickerType.methods.generatePack(testPackPrice, 0, ["0x00000000"], packOwner, testPack).send();
        let packId = reg.events.Register.returnValues.packId;
        await StickerType.methods.setPackOwner(packId, packOwner2).send({from: packOwner});
        await StickerType.methods.purgePack(packId, 0).send();  
    });
        
    it("should change price of pack by user", async function() {
        let testPack = "0x0000000000000000000000000000000000000000000000000000000000000000";
        let testPackPrice = "0";
        let packOwner = accounts[1];
        let reg = await StickerType.methods.generatePack(testPackPrice, 0, ["0x00000000"], packOwner, testPack).send();
        let packId = reg.events.Register.returnValues.packId;
        let r = await StickerType.methods.setPackPrice(packId, 100, 0).send({from: packOwner});
        assert.equal(r.events.PriceChanged.returnValues.packId, packId)
        assert.equal(r.events.PriceChanged.returnValues.dataPrice, 100)
        await StickerType.methods.purgePack(packId, 0).send();  
    });
      
    it("should change pack mintability by user", async function() {
        let testPack = "0x0000000000000000000000000000000000000000000000000000000000000000";
        let testPackPrice = "1";
        let packOwner = accounts[1];
        let reg = await StickerType.methods.generatePack(testPackPrice, 0, ["0x00000000"], packOwner, testPack).send();
        let packId = reg.events.Register.returnValues.packId;
        await StickerType.methods.setPackState(packId,false).send({from: packOwner});
        await StickerType.methods.purgePack(packId, 0).send();  
    });


    it("should change ownership of pack by controller", async function() {
        let testPack = "0x0000000000000000000000000000000000000000000000000000000000000000";
        let testPackPrice = "0";
        let packOwner = accounts[1];
        let packOwner2 = accounts[2];
        let reg = await StickerType.methods.generatePack(testPackPrice, 0, ["0x00000000"], packOwner, testPack).send();
        let packId = reg.events.Register.returnValues.packId;
        await StickerType.methods.setPackOwner(packId, packOwner2).send();
        await StickerType.methods.purgePack(packId, 0).send();  
    });
    
    it("should change price of pack by controller", async function() {
        let testPack = "0x0000000000000000000000000000000000000000000000000000000000000000";
        let testPackPrice = "0";
        let packOwner = accounts[1];
        let reg = await StickerType.methods.generatePack(testPackPrice, 0, ["0x00000000"], packOwner, testPack).send();
        let packId = reg.events.Register.returnValues.packId;
        let r = await StickerType.methods.setPackPrice(packId, 100, 50).send();
        assert.equal(r.events.PriceChanged.returnValues.packId, packId)
        assert.equal(r.events.PriceChanged.returnValues.dataPrice, 100)
        await StickerType.methods.purgePack(packId, 0).send();  
    });

    it("should change pack mintability by controller", async function() {
        let testPack = "0x0000000000000000000000000000000000000000000000000000000000000000";
        let testPackPrice = "1";
        let packOwner = accounts[1];
        let reg = await StickerType.methods.generatePack(testPackPrice, 0, ["0x00000000"], packOwner, testPack).send();
        let packId = reg.events.Register.returnValues.packId;
        await StickerType.methods.setPackState(packId, false).send();
        await StickerType.methods.purgePack(packId, 0).send();  
    });

    it("should change pack contenthash by controller", async function() {
        let testPack = "0x0000000000000000000000000000000000000000000000000000000000000000";
        let testPack2 = "0x00000000000000000000000000000000000000000000000000000000000000FF";
        let testPackPrice = "0";
        let packOwner = accounts[1];
        let reg = await StickerType.methods.generatePack(testPackPrice, 0, ["0x00000000"], packOwner, testPack).send();
        let packId = reg.events.Register.returnValues.packId;
        await StickerType.methods.setPackContenthash(packId, testPack2).send();
        await StickerType.methods.purgePack(packId, 0).send();  
    });

 
});
