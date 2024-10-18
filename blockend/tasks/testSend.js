const { networks } = require("../networks");

task("test-send", "Test croschain transaction").setAction(async (taskArgs) => {
  const { ethers } = hre;
  const [signer] = await ethers.getSigners();
  console.log("Signer: " + signer.address);

  // TODO: Replace
  const abi = [];

  const destination = "storyTestnet";
  console.log(
    "Sending crosschain message from " + network.name + " to " + destination
  );

  const gojoDeployment = networks[network.name].layerZeroTesting;

  const dstId = networks[destination].eid;
  const message = "Erm What the sigma";
  const extraParams = "0x0003010011010000000000000000000000000000c350";
  const args = [dstId, message, extraParams];

  console.log("Args");
  console.log(args);

  const gojo = new ethers.Contract(gojoDeployment, abi, signer);

  const quote = await gojo.getQuote(...args);
  console.log("Quote");
  console.log(quote);

  const response = await gojo.send(...args, {
    value: quote[0],
  });
  const receipt = await response.wait();
  console.log(receipt);
});
