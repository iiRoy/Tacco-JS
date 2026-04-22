const parseIntegerFromString = (stringValue) => {
  const cleanedString = String(stringValue).trim();
  return Number.parseInt(cleanedString, 10);
};

function initiateResourceExchangeSimulation(rawInputContent) {
  if (!rawInputContent || typeof rawInputContent !== 'string') {
    console.error("Invalid input provided for simulation.");
    return;
  }

  const inputDataLines = rawInputContent.split('\n');

  if (inputDataLines.length === 0 || inputDataLines[0].trim() === '') {
    console.error("No initial parameters found in the input.");
    return;
  }

  const [initialValueAlpha, initialValueBeta, numberOfCycles] = inputDataLines[0]
    .split(' ')
    .map(parseIntegerFromString);

  if (isNaN(initialValueAlpha) || isNaN(initialValueBeta) || isNaN(numberOfCycles)) {
      console.error("Failed to parse all initial numerical parameters. Please check input format.");
      return;
  }
  if (numberOfCycles < 0) {
      console.warn("Warning: Negative number of cycles provided. Simulation will not run.");
      return;
  }

  let currentResourceAlpha = initialValueAlpha;
  let currentResourceBeta = initialValueBeta;

  let isAlphaPlayerTurn = true;

  for (let cycleCount = 0; cycleCount < numberOfCycles; ++cycleCount) {
    if (isAlphaPlayerTurn) {
      if (currentResourceAlpha % 2 !== 0) {
        currentResourceAlpha--;
      }

      const transferQuantity = currentResourceAlpha / 2;

      currentResourceAlpha -= transferQuantity;
      currentResourceBeta += transferQuantity;

      isAlphaPlayerTurn = false;
    } else {
      if ((currentResourceBeta & 1) === 1) {
        currentResourceBeta = currentResourceBeta - 1;
      }

      const halfOfBetaResources = currentResourceBeta / 2;

      currentResourceAlpha = currentResourceAlpha + halfOfBetaResources;
      currentResourceBeta = currentResourceBeta - halfOfBetaResources;

      isAlphaPlayerTurn = true;
    }
  }

  console.log(`${Math.floor(currentResourceAlpha)} ${Math.floor(currentResourceBeta)}`);
}

(function executeSimulationFromStdin() {
  if (typeof require !== 'undefined' && typeof module !== 'undefined' && module.exports) {
    try {
      const fileSystemModule = require("fs");
      const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

      initiateResourceExchangeSimulation(standardInputContent);
    } catch (error) {
      console.error("Error reading from stdin or during simulation:", error.message);
    }
  } else {
    console.warn("Non-Node.js environment detected. Simulation will not run without stdin access.");
  }
})();