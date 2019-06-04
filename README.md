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
- `doc`
  - `project_questions.md`: file answering a list of questions around project status
  - `specification.md`: current specefication document
- `test`: Folder for tests

## How to run
Requires https://github.com/creationix/nvm
Usage: 
 ```bash
 nvm install v8.9.4
 nvm use v8.9.4
 npm install -g embark
 git clone https://github.com/status-im/contracts.git
 cd sticker-market
 npm install
 embark simulator
 embark test
 embark run
 ```

| Contract                               | Deploy | Test | UI  |
| -------------------------------------- | ------ | ---- | --- |
| token/TestToken                        | Yes    | Yes  | Yes |
| token/ERC20Token                       | No     | Yes  | Yes |
