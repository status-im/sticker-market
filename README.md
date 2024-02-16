# Status.im Sticker Market Dapp

Sticker Market is composed of 3 contracts: 
- An authorship NFT (`StickerType`) which is granted to every registered `StickerPack` in `StickerMarket`, intended use is to change the deposit address for all `StickerPack`s sold in `StickerMarket`.
- `StickerMarket` main contract, which is the minter of two other NFT smart contract addresses, `StickerType` and `StickerPack`. It allows users to mint `StickerType`, which contains a content-hash link, and other users to mint `StickerPack` referenced to certain `StickerType`s. 
- A purchase NFT (StickerPack) referencing a StickerType, which is granted to any account who paid the value defined in the StickerType while it sale was available. 

Therefore, it models an envoirment where artists can publish their packs for sale, that can be used in official Status app, by holders of StickerPack.  Artists can also sell their token, which new owner could set a new payment address.

## Deployments

| **Contract**                | **Address**                                                                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | 
| **Mainnet**                 |                                                                                                                                         |                                                                                                                   |
| StickerMarket      | [`0x12824271339304d3a9f7e096e62a2a7e73b4a7e7`](https://etherscan.io/address/0x12824271339304d3a9f7e096e62a2a7e73b4a7e7#code)                 |
| StickerPack | [`0x110101156e8F0743948B2A61aFcf3994A8Fb172e`](https://etherscan.io/address/0x110101156e8F0743948B2A61aFcf3994A8Fb172e#code)                 | 
| StickerType  | [`0x0577215622f43a39f4bc9640806dfea9b10d2a36`](https://etherscan.io/address/0x0577215622f43a39f4bc9640806dfea9b10d2a36#code)                 | 
| **Sepolia**                 |                                                                                                                                         |                                                                                                                   |
| StickerMarket      | [`0xf852198D0385c4B871E0B91804ecd47C6bA97351`](https://sepolia.etherscan.io/address/0xf852198d0385c4b871e0b91804ecd47c6ba97351#code)                 |
| StickerPack | [`0x8cc272396Be7583c65BEe82CD7b743c69A87287D`](https://sepolia.etherscan.io/address/0x8cc272396be7583c65bee82cd7b743c69a87287d#code)                 | 
| StickerType  | [`0x5aCBae26C23427AEeE0A7f26949f093577a61AAb`](https://sepolia.etherscan.io/address/0x5acbae26c23427aeee0a7f26949f093577a61aab#code)                 | 



## Folders
- `analyzers`: Folder for analyzer output files
- `app`: Folder containing application for moving Status Test Tokens
- `config`: Embark config files
  - `development`: folder for development network specific config
    - `genesis.json`: configure genesis for development network
  - `blockchain.js`
  - `communication.js`
  - `contracts.js`
  - `namesystem.js`
  - `storage.js`
  - `webserver.js`
- `contracts`: Folder for storing all Solidity contracts
  - `common`: Common standard contracts
  - `status`: Status specific contracts
    - `sticker-market`: Sticker Market specific contracts
      - `StickerMarket.sol`: **Main Sticker Market Logic here**
      - `StickerMarketMigrated.sol`: Example of upgrade logic and a contract that controls the old `StickerMarket.sol`.
  - `token`: Standard token contracts
- `doc`
  - `project_questions.md`: file answering a list of questions around project status
  - `specification.md`: current specefication document
- `test`: Folder for tests

## How to run
Usage: 
 ```bash
git clone https://github.com/status-im/sticker-market.git
cd sticker-market
npm install
npm start
 ```

| Contract                               | Deploy | Test | UI  |
| -------------------------------------- | ------ | ---- | --- |
| token/TestToken                        | Yes    | Yes  | Yes |
| token/ERC20Token                       | No     | Yes  | Yes |

## How to run tests
Usage:
```bash
$ npx embark test ./test/stickermarket.js


Compiling contracts
contracts/status/sticker-market/README.md doesn't have a compatible contract compiler. Maybe a plugin exists for it.
contracts/status/sticker-market/README.md doesn't have a compatible contract compiler. Maybe a plugin exists for it.
  StickerMarket
    ✓ should register packs (1120ms) - [3592664 gas]
    ✓ should categorize packs (894ms) - [810984 gas]
    ✓ should uncategorize packs (971ms) - [288564 gas]
    ✓ should mint packs (1855ms) - [3842190 gas]
    ✓ should mint packs with approveAndCall (1920ms) - [3589096 gas]
    ✓ should register pack with approveAndCall (438ms) - [904022 gas]
    ✓ should purge packs (474ms) - [361631 gas]
    ✓ should not mint a pack with price 0 (275ms) - [466774 gas]
    ✓ should change ownership of pack by user (122ms) - [302190 gas]
    ✓ should change ownership of pack by controller (120ms) - [301833 gas]
    ✓ should change price of pack by user (156ms) - [320666 gas]
    ✓ should change price of pack by controller (119ms) - [335373 gas]
    ✓ should change pack mintability by user (122ms) - [315775 gas]
    ✓ should change pack mintability by controller (126ms) - [315418 gas]
    ✓ should change pack contenthash by controller (186ms) - [320989 gas]
    ✓ should migrate registry (292ms) - [596407 gas]


  16 passing (10s) - [Total: 31234047 gas]
  ```
