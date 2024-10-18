const { networks } = require("../networks");
const {
  abi: gojoAbi,
} = require("../build/artifacts/contracts/Sigma.sol/Sigma.json");

task("get-quote", "Get Quote for crosschain message").setAction(
  async (taskArgs) => {
    const { ethers } = hre;
    const [signer] = await ethers.getSigners();
    console.log("Signer: " + signer.address);

    const destination = "polygonAmoy";
    console.log(
      "Getting quote for crosschain message from " +
        network.name +
        " to " +
        destination
    );

    const gojoDeployment = networks[network.name].layerZeroTesting;

    const dstId = networks[destination].eid;
    const message = "Erm What the sigma";
    const extraParams = "0x0003010011010000000000000000000000000000c350";
    const args = [dstId, message, extraParams];

    console.log("Args");
    console.log(args);

    const gojo = new ethers.Contract(gojoDeployment, gojoAbi, signer);

    const quote = await gojo.getQuote(...args);
    console.log("Quote");
    console.log(quote);
  }
);
