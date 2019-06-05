# Status.im Sticker Market Dapp

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