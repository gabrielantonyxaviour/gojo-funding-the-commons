const { networks } = require("../networks");
const { abi } = require("../build/artifacts/contracts/Sigma.sol/Sigma.json");
task("set-crosschain", "Sets crosschain addresses").setAction(
  async (taskArgs) => {
    const { ethers } = hre;
    const [signer] = await ethers.getSigners();
    console.log(signer.address);

    const gojoDeployment = networks[network.name].layerZeroTesting;

    const dstIds = Object.values(networks)
      .map((network) => network.eid)
      .filter((eid) => eid != networks[network.name].eid);
    const deployments = Object.values(networks)
      .map((network) => network.layerZeroTesting)
      .filter((gojo) => gojo != gojoDeployment);

    const args = [dstIds, deployments];
    console.log(args);
    const gojo = new ethers.Contract(gojoDeployment, abi, signer);
    const response = await gojo.setCrosschainAddresses(...args);
    const receipt = await response.wait();
    console.log(receipt);
  }
);
