module.exports = {
  default: {
    dappConnection: [
      "$EMBARK",
      "$WEB3",
      "ws://localhost:8546",
      "http://localhost:8545"
    ],

    gas: "auto",

    strategy: 'explicit',

    deploy: {
      MiniMeTokenFactory: {
        deploy: true
      },
      MiniMeToken: {
        deploy: true,
        args:["$MiniMeTokenFactory", "0x0", "0x0", "Status Test Token", 18, "STT", true],
      },
      StatusRoot: {
        instanceOf: "TestStatusNetwork",
        deploy: true,
        args: ["0x0", "$MiniMeToken"],
        onDeploy: [
          "await MiniMeToken.methods.changeController(StatusRoot.address).send()",
          "await StatusRoot.methods.setOpen(true).send()",
        ]
      },
      StickerPack: {
        args: []
      },
      StickerType: {
        args: []
      },
      StickerMarket: {
        args: ["$MiniMeToken", "$StickerPack", "$StickerType"],
        onDeploy: [
          "await StickerPack.methods.changeController(StickerMarket.address).send()",
          "await StickerType.methods.changeController(StickerMarket.address).send()",
        ]
      }
    },
    livenet: {
      deploy: {
        MiniMeTokenFactory: {
          deploy: false,
          address: "0xa1c957C0210397D2d0296341627B74411756d476"
        },
        MiniMeToken: {
          deploy: false,
          address: "0x744d70FDBE2Ba4CF95131626614a1763DF805B9E"
        },
        StatusRoot: {
          instanceOf: "StatusNetwork",
          deploy: false,
          address: "0x52aE2B53C847327f95A5084a7C38c0adb12fD302"
        },
        StickerPack: {
          deploy: false,
          address: "0x110101156e8F0743948B2A61aFcf3994A8Fb172e"
        },
        StickerType: {
          deploy: false,
          address: "0x0577215622f43a39f4bc9640806dfea9b10d2a36"
        },
        StickerMarket: {
          deploy: false,
          address: "0x12824271339304d3a9f7e096e62a2a7e73b4a7e7"
        }
      }
    },
    testnet: {
      deploy: {
        MiniMeTokenFactory: {
          deploy: false,
          address: "0x6bFa86A71A7DBc68566d5C741F416e3009804279"
        },
        MiniMeToken: {
          deploy: false,
          address: "0xc55cF4B03948D7EBc8b9E8BAD92643703811d162"
        },
        StatusRoot: {
          instanceOf: "TestStatusNetwork",
          deploy: false,
          address: "0x34358C45FbA99ef9b78cB501584E8cBFa6f85Cef"
        },
        StickerPack: {
          deploy: false,
          address: "0xf852198D0385c4B871E0B91804ecd47C6bA97351"
        },
        StickerType: {
          deploy: false,
          address: "0x8cc272396Be7583c65BEe82CD7b743c69A87287D"
        },
        StickerMarket: {
          deploy: false,
          address: "0x6CC7274aF9cE9572d22DFD8545Fb8c9C9Bcb48AD"
        }
      }
    },
    rinkeby: {
      deploy: {
        MiniMeTokenFactory: {
          deploy: false,
          address: "0x5bA5C786845CaacD45f5952E1135F4bFB8855469"
        },
        MiniMeToken: {
          deploy: false,
          address: "0x43d5adC3B49130A575ae6e4b00dFa4BC55C71621"
        },
        StatusRoot: {
          instanceOf: "TestStatusNetwork",
          deploy: false,
          address: "0xEdEB948dE35C6ac414359f97329fc0b4be70d3f1"
        },
        StickerPack: {
          deploy: false,
          address: "0xf852198D0385c4B871E0B91804ecd47C6bA97351"
        },
        StickerType: {
          deploy: false,
          address: "0x8cc272396Be7583c65BEe82CD7b743c69A87287D"
        },
        StickerMarket: {
          deploy: false,
          address: "0x6CC7274aF9cE9572d22DFD8545Fb8c9C9Bcb48AD"
        }
      }
    }
  },













  
}
