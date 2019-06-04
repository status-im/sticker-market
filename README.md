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
    - `sticker-market`: **Main focus contracts**
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
