const util = require('util');
const rli = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

class InputProcessor {
  constructor(lines) {
    this.dataLines = lines;
    this.currentLineIndex = 0;
  }

  hasMoreInput() {
    return this.currentLineIndex < this.dataLines.length;
  }

  retrieveNextLine() {
    if (!this.hasMoreInput()) {
      throw new Error("No more input lines available.");
    }
    return this.dataLines[this.currentLineIndex++];
  }

  static transformString(inputStr, formatCode) {
    try {
      switch (formatCode) {
        case 1: return parseInt(inputStr, 10);
        case 2: return inputStr.split(" ");
        case 4: return inputStr.split(" ").map(Number);
        case 6: return inputStr.split("");
        case 7: return inputStr.split("").map(Number);
        case 8: return inputStr.join(" ");
        case 9: return inputStr.join("\n");
        case 0: return inputStr.join("");
        default: return inputStr;
      }
    } catch (e) {
      return inputStr;
    }
  }

  getNumericArray() {
    return InputProcessor.transformString(this.retrieveNextLine(), 4);
  }
  getSingleNumber() {
    return InputProcessor.transformString(this.retrieveNextLine(), 1);
  }
  getStringArray() {
    return InputProcessor.transformString(this.retrieveNextLine(), 2);
  }
  getCharacterArray() {
    return InputProcessor.transformString(this.retrieveNextLine(), 6);
  }
}

let allInputLines = [];
let processorInstance;

rli.on('line', (line) => {
  allInputLines.push(line);
});

rli.on('close', () => {
  processorInstance = new InputProcessor(allInputLines);
  console.error("\n");
  const startTime = Date.now();
  executeMainLogic();
  const endTime = Date.now() - startTime;
  logDiagnostic(`Execution time: ${endTime}ms`);
  logDiagnostic(`Memory usage: ${Math.round(process.memoryUsage().heapTotal / 1024)}KB`);
});

function displayOutput(data, joinType = 8) {
  if (Array.isArray(data)) {
    console.log(InputProcessor.transformString(data, joinType));
  } else {
    console.log(data);
  }
}

function logDiagnostic(message) {
  console.error("debug:" + util.inspect(message, false, null));
}

function executeMainLogic() {
  const initialParams = processorInstance.getNumericArray();

  const factorAlpha = initialParams[0] * 100;
  const factorBeta = initialParams[1] * 100;
  const factorGamma = initialParams[2];
  const factorDelta = initialParams[3];
  const maxSolubilityRatio = initialParams[4];
  const totalCapacityLimit = initialParams[5];

  const possibleWaterAmounts = new Set();
  const possibleSaltAmounts = new Set();

  for (let i_val = 0; factorAlpha * i_val <= totalCapacityLimit; i_val++) {
    for (let j_val = 0; factorAlpha * i_val + factorBeta * j_val <= totalCapacityLimit; j_val++) {
      possibleWaterAmounts.add(factorAlpha * i_val + factorBeta * j_val);
    }
  }

  for (let i_val = 0; factorGamma * i_val <= totalCapacityLimit; i_val++) {
    for (let j_val = 0; factorGamma * i_val + factorDelta * j_val <= totalCapacityLimit; j_val++) {
      possibleSaltAmounts.add(factorGamma * i_val + factorDelta * j_val);
    }
  }

  const waterOptionsArray = Array.from(possibleWaterAmounts);
  const saltOptionsArray = Array.from(possibleSaltAmounts);

  let optimalSolution = {
    totalWeight: 0,
    saltWeight: 0,
    currentMaxConcentration: -1
  };

  const checkSolubility = (waterMass, saltMass, solubilityFactor) => {
    return (waterMass / 100 * solubilityFactor) >= saltMass;
  };

  waterOptionsArray.forEach(wAmount => {
    saltOptionsArray.forEach(sAmount => {
      const combinedWeight = wAmount + sAmount;

      if (combinedWeight > totalCapacityLimit || combinedWeight === 0) {
        return;
      }

      if (!checkSolubility(wAmount, sAmount, maxSolubilityRatio)) {
        return;
      }

      const calculatedConcentration = (sAmount * 100) / combinedWeight;

      if (calculatedConcentration > optimalSolution.currentMaxConcentration) {
        optimalSolution = {
          totalWeight: combinedWeight,
          saltWeight: sAmount,
          currentMaxConcentration: calculatedConcentration
        };
      }
    });
  });

  displayOutput([optimalSolution.totalWeight, optimalSolution.saltWeight]);
}
