module.exports = {
  // applies to all environments
  default: {
    enabled: true,
    client: "geth"
  },

  // default environment, merges with the settings in default
  // assumed to be the intended environment by `embark run` and `embark blockchain`
  development: {
    client: "ganache-cli",
    clientConfig: {
      miningMode: 'dev'
    }
  },

  // merges with the settings in default
  // used with "embark run privatenet" and/or "embark blockchain privatenet"
  privatenet: {
    clientConfig: {
      miningMode: 'auto'
    },
    datadir: ".embark/privatenet/datadir",
    accounts: [
      {
        nodeAccounts: true,
        password: "config/privatenet/password" // Password to unlock the account
      }
    ]
  },
  
  testnet: {
    networkType: "testnet",
    syncMode: "light",
    accounts: [
      {
        nodeAccounts: true,
        password: "config/testnet/.password"
      }
    ]
  },

  livenet: {
    networkType: "livenet",
    syncMode: "light",
    rpcCorsDomain: "http://localhost:8000",
    wsOrigins: "http://localhost:8000",
    accounts: [
      {
        nodeAccounts: true,
        password: "config/livenet/.password"
      }
    ]
  },
  
  rinkeby: {
    enabled: true,
    networkType: "rinkeby",
    syncMode: "light",
    rpcHost: "localhost",
    rpcPort: 8545,
    rpcCorsDomain: "http://localhost:8000",
    accounts: [
      {
        nodeAccounts: true,
        password: "config/rinkeby/.password"
      }
    ],
  }
 
};
