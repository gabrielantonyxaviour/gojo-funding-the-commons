import ethers from "ethers";
import { LIT_RPC } from "@lit-protocol/constants";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import dotnev from "dotenv";

dotnev.config();

async function main() {
  try {
    const ethersSigner = new ethers.Wallet(
      process.env.ETHEREUM_PRIVATE_KEY,
      new ethers.providers.JsonRpcProvider(LIT_RPC.CHRONICLE_YELLOWSTONE)
    );

    const litNodeClient = new LitNodeClient({
      litNetwork: LitNetwork.DatilTest,
      debug: false,
    });
    console.log("Connecting LitNodeClient to Lit network...");
    await litNodeClient.connect();
    console.log("Connected LitNodeClient to Lit network");
    const chain = "ethereum";
    const sessionSigs = {
      "https://51.255.59.58:443": {
        sig: "f4df9526ea6d4578acc0e0264df41086b263f637a371940166696bc5b78b368a2c0946dea61f76c3ec0a78e45c10158d81144c67611c3411171a38ab0c7aab06",
        derivedVia: "litSessionSignViaNacl",
        signedMessage: `{"sessionKey":"e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-accesscontrolcondition"},"ability":"access-contr
      ol-condition-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-accesscontrolcondition"},"ability":"access-control-condition-decryption"}],"capabilities":[{"sig":"0xfdf873ad0a0b98003f6f44e95483e979ac93cc85e9bf77914a83
      72b48d101d4b164e60cc1e4331ad657af265ea55ecc514579939c24c04f129f862079a47c8271c","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x0429A2Da7884CA14E53142988D58
      45952fE4DF6a\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-ratelimitincrease://25154'.\\n\\nUR
      I: lit:capability:delegation\\nVersion: 1\\nChain ID: 1\\nNonce: 0x0b790882c05c9c7c109a48716e03cf3b0a2e5ca0e1d15f4c6bffb9f49ac7ccff\\nIssued At: 2024-10-11T14:31:57.349Z\\nExpiration Time: 2024-10-18T14:31:57.346Z\\nResources:
      \\n- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMjUxNTQiOnsiQXV0aC9BdXRoIjpbeyJkZWxlZ2F0ZV90byI6WyIwNDI5QTJEYTc4ODRDQTE0RTUzMTQyOTg4RDU4NDU5NTJmRTRERjZhIl0sIm5mdF9pZCI6WyIyNTE1NCJdLCJ1c2VzIjoiMSJ9XX19LCJwcmYiOltdfQ"
      ,"address":"0x0429A2Da7884CA14E53142988D5845952fE4DF6a"},{"sig":"0xe11eeaf387201790e37579f48c0557008f4113c4c12b3d0773b4d80a463f4bc620dfc60a15f7018f78229b9a96415ad31e352132c6e108656a30d4bd8daa0ab11b","derivedVia":"web3.eth.pers
      onal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x0429A2Da7884CA14E53142988D5845952fE4DF6a\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the st
      ated URI to perform the following actions on my behalf: (1) 'Threshold': 'Decryption', 'Signing' for 'lit-accesscontrolcondition://*'.\\n\\nURI: lit:session:e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df\\nVe
      rsion: 1\\nChain ID: 1\\nNonce: 0x0b790882c05c9c7c109a48716e03cf3b0a2e5ca0e1d15f4c6bffb9f49ac7ccff\\nIssued At: 2024-10-11T14:31:57.378Z\\nExpiration Time: 2024-10-11T22:51:57.355Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LW
      FjY2Vzc2NvbnRyb2xjb25kaXRpb246Ly8qIjp7IlRocmVzaG9sZC9EZWNyeXB0aW9uIjpbe31dLCJUaHJlc2hvbGQvU2lnbmluZyI6W3t9XX19LCJwcmYiOltdfQ","address":"0x0429A2Da7884CA14E53142988D5845952fE4DF6a"}],"issuedAt":"2024-10-11T14:31:57.391Z","expi
      ration":"2024-10-11T22:51:57.355Z","nodeAddress":"https://51.255.59.58:443"}`,
        address:
          "e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df",
        algo: "ed25519",
      },
      "https://173.208.48.215:443": {
        sig: "e0389512a215c5a28493f4ac54389fbd9f18ad9e18776ed338e5ee1f0685c1c7938bb1e7e4b6a017572d1d5be3937046b11afdc4cb4e8fcf0c861bdf8b177906",
        derivedVia: "litSessionSignViaNacl",
        signedMessage: `{"sessionKey":"e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-accesscontrolcondition"},"ability":"access-contr
      ol-condition-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-accesscontrolcondition"},"ability":"access-control-condition-decryption"}],"capabilities":[{"sig":"0xfdf873ad0a0b98003f6f44e95483e979ac93cc85e9bf77914a83
      72b48d101d4b164e60cc1e4331ad657af265ea55ecc514579939c24c04f129f862079a47c8271c","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x0429A2Da7884CA14E53142988D58
      45952fE4DF6a\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-ratelimitincrease://25154'.\\n\\nUR
      I: lit:capability:delegation\\nVersion: 1\\nChain ID: 1\\nNonce: 0x0b790882c05c9c7c109a48716e03cf3b0a2e5ca0e1d15f4c6bffb9f49ac7ccff\\nIssued At: 2024-10-11T14:31:57.349Z\\nExpiration Time: 2024-10-18T14:31:57.346Z\\nResources:
      \\n- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMjUxNTQiOnsiQXV0aC9BdXRoIjpbeyJkZWxlZ2F0ZV90byI6WyIwNDI5QTJEYTc4ODRDQTE0RTUzMTQyOTg4RDU4NDU5NTJmRTRERjZhIl0sIm5mdF9pZCI6WyIyNTE1NCJdLCJ1c2VzIjoiMSJ9XX19LCJwcmYiOltdfQ"
      ,"address":"0x0429A2Da7884CA14E53142988D5845952fE4DF6a"},{"sig":"0xe11eeaf387201790e37579f48c0557008f4113c4c12b3d0773b4d80a463f4bc620dfc60a15f7018f78229b9a96415ad31e352132c6e108656a30d4bd8daa0ab11b","derivedVia":"web3.eth.pers
      onal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x0429A2Da7884CA14E53142988D5845952fE4DF6a\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the st
      ated URI to perform the following actions on my behalf: (1) 'Threshold': 'Decryption', 'Signing' for 'lit-accesscontrolcondition://*'.\\n\\nURI: lit:session:e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df\\nVe
      rsion: 1\\nChain ID: 1\\nNonce: 0x0b790882c05c9c7c109a48716e03cf3b0a2e5ca0e1d15f4c6bffb9f49ac7ccff\\nIssued At: 2024-10-11T14:31:57.378Z\\nExpiration Time: 2024-10-11T22:51:57.355Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LW
      FjY2Vzc2NvbnRyb2xjb25kaXRpb246Ly8qIjp7IlRocmVzaG9sZC9EZWNyeXB0aW9uIjpbe31dLCJUaHJlc2hvbGQvU2lnbmluZyI6W3t9XX19LCJwcmYiOltdfQ","address":"0x0429A2Da7884CA14E53142988D5845952fE4DF6a"}],"issuedAt":"2024-10-11T14:31:57.391Z","expi
      ration":"2024-10-11T22:51:57.355Z","nodeAddress":"https://173.208.48.215:443"}`,
        address:
          "e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df",
        algo: "ed25519",
      },
      "https://199.115.117.115:443": {
        sig: "d0a12339cfe35cfdb98b230407e14cc6217bac44cf9bfbc852e500201d0b14b2f4620c740d935f01dca78f91046974dfa371ebb1b6de2514db4009d4c07d7808",
        derivedVia: "litSessionSignViaNacl",
        signedMessage: `{"sessionKey":"e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-accesscontrolcondition"},"ability":"access-contr
      ol-condition-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-accesscontrolcondition"},"ability":"access-control-condition-decryption"}],"capabilities":[{"sig":"0xfdf873ad0a0b98003f6f44e95483e979ac93cc85e9bf77914a83
      72b48d101d4b164e60cc1e4331ad657af265ea55ecc514579939c24c04f129f862079a47c8271c","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x0429A2Da7884CA14E53142988D58
      45952fE4DF6a\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-ratelimitincrease://25154'.\\n\\nUR
      I: lit:capability:delegation\\nVersion: 1\\nChain ID: 1\\nNonce: 0x0b790882c05c9c7c109a48716e03cf3b0a2e5ca0e1d15f4c6bffb9f49ac7ccff\\nIssued At: 2024-10-11T14:31:57.349Z\\nExpiration Time: 2024-10-18T14:31:57.346Z\\nResources:
      \\n- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMjUxNTQiOnsiQXV0aC9BdXRoIjpbeyJkZWxlZ2F0ZV90byI6WyIwNDI5QTJEYTc4ODRDQTE0RTUzMTQyOTg4RDU4NDU5NTJmRTRERjZhIl0sIm5mdF9pZCI6WyIyNTE1NCJdLCJ1c2VzIjoiMSJ9XX19LCJwcmYiOltdfQ"
      ,"address":"0x0429A2Da7884CA14E53142988D5845952fE4DF6a"},{"sig":"0xe11eeaf387201790e37579f48c0557008f4113c4c12b3d0773b4d80a463f4bc620dfc60a15f7018f78229b9a96415ad31e352132c6e108656a30d4bd8daa0ab11b","derivedVia":"web3.eth.pers
      onal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x0429A2Da7884CA14E53142988D5845952fE4DF6a\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the st
      ated URI to perform the following actions on my behalf: (1) 'Threshold': 'Decryption', 'Signing' for 'lit-accesscontrolcondition://*'.\\n\\nURI: lit:session:e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df\\nVe
      rsion: 1\\nChain ID: 1\\nNonce: 0x0b790882c05c9c7c109a48716e03cf3b0a2e5ca0e1d15f4c6bffb9f49ac7ccff\\nIssued At: 2024-10-11T14:31:57.378Z\\nExpiration Time: 2024-10-11T22:51:57.355Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LW
      FjY2Vzc2NvbnRyb2xjb25kaXRpb246Ly8qIjp7IlRocmVzaG9sZC9EZWNyeXB0aW9uIjpbe31dLCJUaHJlc2hvbGQvU2lnbmluZyI6W3t9XX19LCJwcmYiOltdfQ","address":"0x0429A2Da7884CA14E53142988D5845952fE4DF6a"}],"issuedAt":"2024-10-11T14:31:57.391Z","expi
      ration":"2024-10-11T22:51:57.355Z","nodeAddress":"https://199.115.117.115:443"}`,
        address:
          "e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df",
        algo: "ed25519",
      },
      "https://207.244.72.175:443": {
        sig: "dbb5cc637e5a9b289e519a55cb4eb29a00400015eab8441d1352d56861e5b5cde6979067ac1b2706f0ebe2bc98955ebb048ff4a3a5e475380da928648d3b5a05",
        derivedVia: "litSessionSignViaNacl",
        signedMessage: `{"sessionKey":"e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-accesscontrolcondition"},"ability":"access-contr
      ol-condition-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-accesscontrolcondition"},"ability":"access-control-condition-decryption"}],"capabilities":[{"sig":"0xfdf873ad0a0b98003f6f44e95483e979ac93cc85e9bf77914a83
      72b48d101d4b164e60cc1e4331ad657af265ea55ecc514579939c24c04f129f862079a47c8271c","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x0429A2Da7884CA14E53142988D58
      45952fE4DF6a\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-ratelimitincrease://25154'.\\n\\nUR
      I: lit:capability:delegation\\nVersion: 1\\nChain ID: 1\\nNonce: 0x0b790882c05c9c7c109a48716e03cf3b0a2e5ca0e1d15f4c6bffb9f49ac7ccff\\nIssued At: 2024-10-11T14:31:57.349Z\\nExpiration Time: 2024-10-18T14:31:57.346Z\\nResources:
      \\n- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMjUxNTQiOnsiQXV0aC9BdXRoIjpbeyJkZWxlZ2F0ZV90byI6WyIwNDI5QTJEYTc4ODRDQTE0RTUzMTQyOTg4RDU4NDU5NTJmRTRERjZhIl0sIm5mdF9pZCI6WyIyNTE1NCJdLCJ1c2VzIjoiMSJ9XX19LCJwcmYiOltdfQ"
      ,"address":"0x0429A2Da7884CA14E53142988D5845952fE4DF6a"},{"sig":"0xe11eeaf387201790e37579f48c0557008f4113c4c12b3d0773b4d80a463f4bc620dfc60a15f7018f78229b9a96415ad31e352132c6e108656a30d4bd8daa0ab11b","derivedVia":"web3.eth.pers
      onal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x0429A2Da7884CA14E53142988D5845952fE4DF6a\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the st
      ated URI to perform the following actions on my behalf: (1) 'Threshold': 'Decryption', 'Signing' for 'lit-accesscontrolcondition://*'.\\n\\nURI: lit:session:e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df\\nVe
      rsion: 1\\nChain ID: 1\\nNonce: 0x0b790882c05c9c7c109a48716e03cf3b0a2e5ca0e1d15f4c6bffb9f49ac7ccff\\nIssued At: 2024-10-11T14:31:57.378Z\\nExpiration Time: 2024-10-11T22:51:57.355Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LW
      FjY2Vzc2NvbnRyb2xjb25kaXRpb246Ly8qIjp7IlRocmVzaG9sZC9EZWNyeXB0aW9uIjpbe31dLCJUaHJlc2hvbGQvU2lnbmluZyI6W3t9XX19LCJwcmYiOltdfQ","address":"0x0429A2Da7884CA14E53142988D5845952fE4DF6a"}],"issuedAt":"2024-10-11T14:31:57.391Z","expi
      ration":"2024-10-11T22:51:57.355Z","nodeAddress":"https://207.244.72.175:443"}`,
        address:
          "e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df",
        algo: "ed25519",
      },
      "https://158.69.108.66:443": {
        sig: "dffca41648ffeaee272045a3772b1e5108af9ca7ed99cf7d9b7489f955491413df46dc6c8bfa23ea7f3025f16c86be0cd3173cb33db74cf09add74ae89670e0f",
        derivedVia: "litSessionSignViaNacl",
        signedMessage: `{"sessionKey":"e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-accesscontrolcondition"},"ability":"access-contr
      ol-condition-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-accesscontrolcondition"},"ability":"access-control-condition-decryption"}],"capabilities":[{"sig":"0xfdf873ad0a0b98003f6f44e95483e979ac93cc85e9bf77914a83
      72b48d101d4b164e60cc1e4331ad657af265ea55ecc514579939c24c04f129f862079a47c8271c","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x0429A2Da7884CA14E53142988D58
      45952fE4DF6a\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-ratelimitincrease://25154'.\\n\\nUR
      I: lit:capability:delegation\\nVersion: 1\\nChain ID: 1\\nNonce: 0x0b790882c05c9c7c109a48716e03cf3b0a2e5ca0e1d15f4c6bffb9f49ac7ccff\\nIssued At: 2024-10-11T14:31:57.349Z\\nExpiration Time: 2024-10-18T14:31:57.346Z\\nResources:
      \\n- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMjUxNTQiOnsiQXV0aC9BdXRoIjpbeyJkZWxlZ2F0ZV90byI6WyIwNDI5QTJEYTc4ODRDQTE0RTUzMTQyOTg4RDU4NDU5NTJmRTRERjZhIl0sIm5mdF9pZCI6WyIyNTE1NCJdLCJ1c2VzIjoiMSJ9XX19LCJwcmYiOltdfQ"
      ,"address":"0x0429A2Da7884CA14E53142988D5845952fE4DF6a"},{"sig":"0xe11eeaf387201790e37579f48c0557008f4113c4c12b3d0773b4d80a463f4bc620dfc60a15f7018f78229b9a96415ad31e352132c6e108656a30d4bd8daa0ab11b","derivedVia":"web3.eth.pers
      onal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x0429A2Da7884CA14E53142988D5845952fE4DF6a\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the st
      ated URI to perform the following actions on my behalf: (1) 'Threshold': 'Decryption', 'Signing' for 'lit-accesscontrolcondition://*'.\\n\\nURI: lit:session:e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df\\nVe
      rsion: 1\\nChain ID: 1\\nNonce: 0x0b790882c05c9c7c109a48716e03cf3b0a2e5ca0e1d15f4c6bffb9f49ac7ccff\\nIssued At: 2024-10-11T14:31:57.378Z\\nExpiration Time: 2024-10-11T22:51:57.355Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LW
      FjY2Vzc2NvbnRyb2xjb25kaXRpb246Ly8qIjp7IlRocmVzaG9sZC9EZWNyeXB0aW9uIjpbe31dLCJUaHJlc2hvbGQvU2lnbmluZyI6W3t9XX19LCJwcmYiOltdfQ","address":"0x0429A2Da7884CA14E53142988D5845952fE4DF6a"}],"issuedAt":"2024-10-11T14:31:57.391Z","expi
      ration":"2024-10-11T22:51:57.355Z","nodeAddress":"https://158.69.108.66:443"}`,
        address:
          "e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df",
        algo: "ed25519",
      },
      "https://158.69.163.138:443": {
        sig: "d51a9dfb2d15499016655b6e18b86ee6728a97ff97d0ac88a6f857ed29571299e4d584d184b613af72bda510b6ed866070e297f68749cd7f48c5a58169f71e06",
        derivedVia: "litSessionSignViaNacl",
        signedMessage: `{"sessionKey":"e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-accesscontrolcondition"},"ability":"access-contr
      ol-condition-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-accesscontrolcondition"},"ability":"access-control-condition-decryption"}],"capabilities":[{"sig":"0xfdf873ad0a0b98003f6f44e95483e979ac93cc85e9bf77914a83
      72b48d101d4b164e60cc1e4331ad657af265ea55ecc514579939c24c04f129f862079a47c8271c","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x0429A2Da7884CA14E53142988D58
      45952fE4DF6a\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-ratelimitincrease://25154'.\\n\\nUR
      I: lit:capability:delegation\\nVersion: 1\\nChain ID: 1\\nNonce: 0x0b790882c05c9c7c109a48716e03cf3b0a2e5ca0e1d15f4c6bffb9f49ac7ccff\\nIssued At: 2024-10-11T14:31:57.349Z\\nExpiration Time: 2024-10-18T14:31:57.346Z\\nResources:
      \\n- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMjUxNTQiOnsiQXV0aC9BdXRoIjpbeyJkZWxlZ2F0ZV90byI6WyIwNDI5QTJEYTc4ODRDQTE0RTUzMTQyOTg4RDU4NDU5NTJmRTRERjZhIl0sIm5mdF9pZCI6WyIyNTE1NCJdLCJ1c2VzIjoiMSJ9XX19LCJwcmYiOltdfQ"
      ,"address":"0x0429A2Da7884CA14E53142988D5845952fE4DF6a"},{"sig":"0xe11eeaf387201790e37579f48c0557008f4113c4c12b3d0773b4d80a463f4bc620dfc60a15f7018f78229b9a96415ad31e352132c6e108656a30d4bd8daa0ab11b","derivedVia":"web3.eth.pers
      onal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x0429A2Da7884CA14E53142988D5845952fE4DF6a\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the st
      ated URI to perform the following actions on my behalf: (1) 'Threshold': 'Decryption', 'Signing' for 'lit-accesscontrolcondition://*'.\\n\\nURI: lit:session:e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df\\nVe
      rsion: 1\\nChain ID: 1\\nNonce: 0x0b790882c05c9c7c109a48716e03cf3b0a2e5ca0e1d15f4c6bffb9f49ac7ccff\\nIssued At: 2024-10-11T14:31:57.378Z\\nExpiration Time: 2024-10-11T22:51:57.355Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LW
      FjY2Vzc2NvbnRyb2xjb25kaXRpb246Ly8qIjp7IlRocmVzaG9sZC9EZWNyeXB0aW9uIjpbe31dLCJUaHJlc2hvbGQvU2lnbmluZyI6W3t9XX19LCJwcmYiOltdfQ","address":"0x0429A2Da7884CA14E53142988D5845952fE4DF6a"}],"issuedAt":"2024-10-11T14:31:57.391Z","expi
      ration":"2024-10-11T22:51:57.355Z","nodeAddress":"https://158.69.163.138:443"}`,
        address:
          "e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df",
        algo: "ed25519",
      },
      "https://167.114.17.202:443": {
        sig: "050b9eab302320a60906850607ff3c71cbd492e7f798e95c91996a87dde8fc1fcd477872b1d5df60fb008e72789057d1e1c7f74bb793149ad4cabe697411bf0f",
        derivedVia: "litSessionSignViaNacl",
        signedMessage: `{"sessionKey":"e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-accesscontrolcondition"},"ability":"access-contr
      ol-condition-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-accesscontrolcondition"},"ability":"access-control-condition-decryption"}],"capabilities":[{"sig":"0xfdf873ad0a0b98003f6f44e95483e979ac93cc85e9bf77914a83
      72b48d101d4b164e60cc1e4331ad657af265ea55ecc514579939c24c04f129f862079a47c8271c","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x0429A2Da7884CA14E53142988D58
      45952fE4DF6a\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-ratelimitincrease://25154'.\\n\\nUR
      I: lit:capability:delegation\\nVersion: 1\\nChain ID: 1\\nNonce: 0x0b790882c05c9c7c109a48716e03cf3b0a2e5ca0e1d15f4c6bffb9f49ac7ccff\\nIssued At: 2024-10-11T14:31:57.349Z\\nExpiration Time: 2024-10-18T14:31:57.346Z\\nResources:
      \\n- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMjUxNTQiOnsiQXV0aC9BdXRoIjpbeyJkZWxlZ2F0ZV90byI6WyIwNDI5QTJEYTc4ODRDQTE0RTUzMTQyOTg4RDU4NDU5NTJmRTRERjZhIl0sIm5mdF9pZCI6WyIyNTE1NCJdLCJ1c2VzIjoiMSJ9XX19LCJwcmYiOltdfQ"
      ,"address":"0x0429A2Da7884CA14E53142988D5845952fE4DF6a"},{"sig":"0xe11eeaf387201790e37579f48c0557008f4113c4c12b3d0773b4d80a463f4bc620dfc60a15f7018f78229b9a96415ad31e352132c6e108656a30d4bd8daa0ab11b","derivedVia":"web3.eth.pers
      onal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x0429A2Da7884CA14E53142988D5845952fE4DF6a\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the st
      ated URI to perform the following actions on my behalf: (1) 'Threshold': 'Decryption', 'Signing' for 'lit-accesscontrolcondition://*'.\\n\\nURI: lit:session:e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df\\nVe
      rsion: 1\\nChain ID: 1\\nNonce: 0x0b790882c05c9c7c109a48716e03cf3b0a2e5ca0e1d15f4c6bffb9f49ac7ccff\\nIssued At: 2024-10-11T14:31:57.378Z\\nExpiration Time: 2024-10-11T22:51:57.355Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LW
      FjY2Vzc2NvbnRyb2xjb25kaXRpb246Ly8qIjp7IlRocmVzaG9sZC9EZWNyeXB0aW9uIjpbe31dLCJUaHJlc2hvbGQvU2lnbmluZyI6W3t9XX19LCJwcmYiOltdfQ","address":"0x0429A2Da7884CA14E53142988D5845952fE4DF6a"}],"issuedAt":"2024-10-11T14:31:57.391Z","expi
      ration":"2024-10-11T22:51:57.355Z","nodeAddress":"https://167.114.17.202:443"}`,
        address:
          "e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df",
        algo: "ed25519",
      },
      "https://167.114.17.201:443": {
        sig: "602bc25978093d47e389fd899c643ac6bc549e857f0aef4460e308b7d4aff21f30b17d0667ba175a27b83bca43189007d616952dd217d53726b5bfb9eb3ff801",
        derivedVia: "litSessionSignViaNacl",
        signedMessage: `{"sessionKey":"e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-accesscontrolcondition"},"ability":"access-contr
      ol-condition-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-accesscontrolcondition"},"ability":"access-control-condition-decryption"}],"capabilities":[{"sig":"0xfdf873ad0a0b98003f6f44e95483e979ac93cc85e9bf77914a83
      72b48d101d4b164e60cc1e4331ad657af265ea55ecc514579939c24c04f129f862079a47c8271c","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x0429A2Da7884CA14E53142988D58
      45952fE4DF6a\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-ratelimitincrease://25154'.\\n\\nUR
      I: lit:capability:delegation\\nVersion: 1\\nChain ID: 1\\nNonce: 0x0b790882c05c9c7c109a48716e03cf3b0a2e5ca0e1d15f4c6bffb9f49ac7ccff\\nIssued At: 2024-10-11T14:31:57.349Z\\nExpiration Time: 2024-10-18T14:31:57.346Z\\nResources:
      \\n- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMjUxNTQiOnsiQXV0aC9BdXRoIjpbeyJkZWxlZ2F0ZV90byI6WyIwNDI5QTJEYTc4ODRDQTE0RTUzMTQyOTg4RDU4NDU5NTJmRTRERjZhIl0sIm5mdF9pZCI6WyIyNTE1NCJdLCJ1c2VzIjoiMSJ9XX19LCJwcmYiOltdfQ"
      ,"address":"0x0429A2Da7884CA14E53142988D5845952fE4DF6a"},{"sig":"0xe11eeaf387201790e37579f48c0557008f4113c4c12b3d0773b4d80a463f4bc620dfc60a15f7018f78229b9a96415ad31e352132c6e108656a30d4bd8daa0ab11b","derivedVia":"web3.eth.pers
      onal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x0429A2Da7884CA14E53142988D5845952fE4DF6a\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the st
      ated URI to perform the following actions on my behalf: (1) 'Threshold': 'Decryption', 'Signing' for 'lit-accesscontrolcondition://*'.\\n\\nURI: lit:session:e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df\\nVe
      rsion: 1\\nChain ID: 1\\nNonce: 0x0b790882c05c9c7c109a48716e03cf3b0a2e5ca0e1d15f4c6bffb9f49ac7ccff\\nIssued At: 2024-10-11T14:31:57.378Z\\nExpiration Time: 2024-10-11T22:51:57.355Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LW
      FjY2Vzc2NvbnRyb2xjb25kaXRpb246Ly8qIjp7IlRocmVzaG9sZC9EZWNyeXB0aW9uIjpbe31dLCJUaHJlc2hvbGQvU2lnbmluZyI6W3t9XX19LCJwcmYiOltdfQ","address":"0x0429A2Da7884CA14E53142988D5845952fE4DF6a"}],"issuedAt":"2024-10-11T14:31:57.391Z","expi
      ration":"2024-10-11T22:51:57.355Z","nodeAddress":"https://167.114.17.201:443"}`,
        address:
          "e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df",
        algo: "ed25519",
      },
      "https://147.135.61.242:443": {
        sig: "7dc32265eb27369f6dd1bd407f60cf71f1fc311ee3fd4a7e5e9c3f2552d87246cf6b453d4676eed3ba71343a7804e61352349ac11bc98ad709033736650d2e04",
        derivedVia: "litSessionSignViaNacl",
        signedMessage: `{"sessionKey":"e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df","resourceAbilityRequests":[{"resource":{"resource":"*","resourcePrefix":"lit-accesscontrolcondition"},"ability":"access-contr
      ol-condition-signing"},{"resource":{"resource":"*","resourcePrefix":"lit-accesscontrolcondition"},"ability":"access-control-condition-decryption"}],"capabilities":[{"sig":"0xfdf873ad0a0b98003f6f44e95483e979ac93cc85e9bf77914a83
      72b48d101d4b164e60cc1e4331ad657af265ea55ecc514579939c24c04f129f862079a47c8271c","derivedVia":"web3.eth.personal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x0429A2Da7884CA14E53142988D58
      45952fE4DF6a\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the stated URI to perform the following actions on my behalf: (1) 'Auth': 'Auth' for 'lit-ratelimitincrease://25154'.\\n\\nUR
      I: lit:capability:delegation\\nVersion: 1\\nChain ID: 1\\nNonce: 0x0b790882c05c9c7c109a48716e03cf3b0a2e5ca0e1d15f4c6bffb9f49ac7ccff\\nIssued At: 2024-10-11T14:31:57.349Z\\nExpiration Time: 2024-10-18T14:31:57.346Z\\nResources:
      \\n- urn:recap:eyJhdHQiOnsibGl0LXJhdGVsaW1pdGluY3JlYXNlOi8vMjUxNTQiOnsiQXV0aC9BdXRoIjpbeyJkZWxlZ2F0ZV90byI6WyIwNDI5QTJEYTc4ODRDQTE0RTUzMTQyOTg4RDU4NDU5NTJmRTRERjZhIl0sIm5mdF9pZCI6WyIyNTE1NCJdLCJ1c2VzIjoiMSJ9XX19LCJwcmYiOltdfQ"
      ,"address":"0x0429A2Da7884CA14E53142988D5845952fE4DF6a"},{"sig":"0xe11eeaf387201790e37579f48c0557008f4113c4c12b3d0773b4d80a463f4bc620dfc60a15f7018f78229b9a96415ad31e352132c6e108656a30d4bd8daa0ab11b","derivedVia":"web3.eth.pers
      onal.sign","signedMessage":"localhost wants you to sign in with your Ethereum account:\\n0x0429A2Da7884CA14E53142988D5845952fE4DF6a\\n\\nThis is a test statement.  You can put anything you want here. I further authorize the st
      ated URI to perform the following actions on my behalf: (1) 'Threshold': 'Decryption', 'Signing' for 'lit-accesscontrolcondition://*'.\\n\\nURI: lit:session:e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df\\nVe
      rsion: 1\\nChain ID: 1\\nNonce: 0x0b790882c05c9c7c109a48716e03cf3b0a2e5ca0e1d15f4c6bffb9f49ac7ccff\\nIssued At: 2024-10-11T14:31:57.378Z\\nExpiration Time: 2024-10-11T22:51:57.355Z\\nResources:\\n- urn:recap:eyJhdHQiOnsibGl0LW
      FjY2Vzc2NvbnRyb2xjb25kaXRpb246Ly8qIjp7IlRocmVzaG9sZC9EZWNyeXB0aW9uIjpbe31dLCJUaHJlc2hvbGQvU2lnbmluZyI6W3t9XX19LCJwcmYiOltdfQ","address":"0x0429A2Da7884CA14E53142988D5845952fE4DF6a"}],"issuedAt":"2024-10-11T14:31:57.391Z","expi
      ration":"2024-10-11T22:51:57.355Z","nodeAddress":"https://147.135.61.242:443"}`,
        address:
          "e2ac2130ea652a49685ddf847a9984e7e8058a53a3f320130921e6c12aaf01df",
        algo: "ed25519",
      },
    };
    var unifiedAccessControlConditions = [
      {
        conditionType: "evmBasic",
        contractAddress: "",
        standardContractType: "",
        chain,
        method: "eth_getBalance",
        parameters: [":userAddress", "latest"],
        returnValueTest: {
          comparator: ">=",
          value: "0",
        },
      },
    ];

    console.log("Encrypting Data...");
    const { ciphertext, dataToEncryptHash } =
      await LitJsSdk.zipAndEncryptString(
        {
          unifiedAccessControlConditions,
          chain,
          sessionSigs,
          dataToEncrypt: "this is a secret message",
        },
        litNodeClient
      );
    console.log("Data Encrypted Successfully");

    console.log("Decrypting Data...");
    const decryptedFiles = await LitJsSdk.decryptToZip(
      {
        unifiedAccessControlConditions,
        chain,
        sessionSigs,
        ciphertext,
        dataToEncryptHash,
      },
      litNodeClient
    );
    const decryptedString = await decryptedFiles["string.txt"].async("text");
    console.log("decrypted string", decryptedString);
    return jwt;
  } catch (e) {
    return e;
  }
}

main()
  .then((res) => {
    console.log(res);
    return 0;
  })
  .catch((err) => {
    if (err) console.error(err);
    return 1;
  });
