const express = require("express");
const cors = require("cors");

const bodyParser = require("body-parser");
const solc = require("solc");

const app = express();
const PORT = 3001;

// Middleware to parse JSON bodies
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  console.log("Hello, World!");
  res.send("Hello, World!");
});

// Endpoint to compile Solidity contract
app.post("/compile", (req, res) => {
  const { contractCode, name } = req.body;
  console.log("Received compile code request: " + name);
  const cName = name + ".sol";

  if (!contractCode) {
    return res.status(400).json({ error: "No contract code provided" });
  }

  try {
    // Set up the input format for Solidity compiler
    const input = {
      language: "Solidity",
      sources: {
        [cName]: {
          content: contractCode,
        },
      },
      settings: {
        outputSelection: {
          "*": {
            "*": ["abi", "evm.bytecode"],
          },
        },
      },
    };

    // Compile the contract
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    // Check for compilation errors
    if (output.errors.filter((error) => error.severity === "error").length) {
      const errors = output.errors.filter(
        (error) => error.severity === "error"
      );
      return res.status(400).json({ errors });
    }

    // Get the compiled contract details
    const contractName = Object.keys(output.contracts[cName])[0];
    const compiledContract = output.contracts[cName][contractName];
    const { abi, evm } = compiledContract;

    // Respond with ABI and bytecode
    res.status(200).json({
      abi,
      bytecode: evm.bytecode.object,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to compile the contract" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
