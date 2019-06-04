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
    ✓ should register packs (1301ms) - [3592112 gas]
    ✓ should categorize packs (870ms) - [810808 gas]
    ✓ should uncategorize packs (901ms) - [288465 gas]
    ✓ should mint packs (1792ms) - [3505648 gas]
    ✓ should mint packs with approveAndCall (1747ms) - [3221506 gas]
    ✓ should register pack with approveAndCall (451ms) - [936548 gas]
    ✓ should purge packs (464ms) - [361631 gas]
    ✓ should not mint a pack with price 0 (238ms) - [466792 gas]
    ✓ should migrate registry (273ms) - [550475 gas]


  9 passing (24s) - [Total: 30804644 gas]
  ```