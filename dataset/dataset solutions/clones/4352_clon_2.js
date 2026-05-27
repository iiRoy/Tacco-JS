var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataProcessor;
var inputLines = [];

inputReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

inputReader.on('close', function() {
  dataProcessor = initializeInputProcessor(inputLines);
  console.error("\n");
  var startTime = Date.now();
  executeSolution();
  var elapsedTime = Date.now() - startTime;
  logDebugMessage("time : " + (elapsedTime) + "ms");
  logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function createDeepCopy(originalObject) {
  return JSON.parse(JSON.stringify(originalObject));
}

function retrieveNextInteger() {
  return performConversion(fetchNextItem(), 1);
}

function retrieveNextStringArray() {
  return performConversion(fetchNextItem(), 2);
}

function retrieveNextIntegerArray() {
  return performConversion(fetchNextItem(), 4);
}

function retrieveNextCharacterArray() {
  return performConversion(fetchNextItem(), 6);
}

function fetchNextItem() {
  return dataProcessor.fetchNextItem();
}

function hasMoreItems() {
  return dataProcessor.hasMoreItems();
}

function initializeInputProcessor(incomingData) {
  var processorInstance = {
    sourceData: incomingData,
    currentIdx: 0,
    maxIdx: incomingData.length,
    hasMoreItems: function() {
      return (this.currentIdx < this.maxIdx);
    },
    fetchNextItem: function() {
      if (!this.hasMoreItems()) {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      } else {
        var currentInput = this.sourceData[this.currentIdx++];
        return currentInput;
      }
    }
  };
  return processorInstance;
}

function printResult(messageContent) {
  console.log(messageContent);
}

function logDebugMessage(messageContent) {
  console.error("debug:" + require("util").inspect(messageContent, false, null));
}

// The 'conversionType' parameter dictates the transformation:
// 1: Parse as an integer.
// 2: Split by spaces into a string array.
// 4: Split by spaces and convert to an integer array.
// 6: Split into a character array.
// 7: Split into a character array and convert to an integer array.
// 8: Join array elements with a space.
// 9: Join array elements with a newline.
// 0: Join array elements without any separator.
// Default: Return the input value as is.
function performConversion(inputVal, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputVal);
      case 2:
        return inputVal.split(" ");
      case 4:
        return inputVal.split(" ").map(Number);
      case 6:
        return inputVal.split("");
      case 7:
        return inputVal.split("").map(Number);
      case 8:
        return inputVal.join(" ");
      case 9:
        return inputVal.join("\n");
      case 0:
        return inputVal.join("");
      default:
        return inputVal;
    }
  } catch (error) {
    return inputVal;
  }
}

function executeSolution() {
  var initialParams = retrieveNextIntegerArray();
  var paramA = initialParams[0] * 100;
  var paramB = initialParams[1] * 100;
  var paramC = initialParams[2];
  var paramD = initialParams[3];
  var paramE = initialParams[4];
  var paramF = initialParams[5];

  var highestConcentration = 0;
  var resultPair = [0, 0];

  var possibleWaterAmounts = new Set();
  var possibleSoluteAmounts = new Set();

  var loopLimit = 3000;

  // Iterate to find all possible water and solute quantities
  for (var idxA = 0; idxA <= loopLimit; idxA++) {
    for (var idxB = 0; idxB <= loopLimit; idxB++) {
      var currentWater = paramA * idxA + paramB * idxB;
      var currentSolute = paramC * idxA + paramD * idxB;

      if (currentWater <= paramF) {
        possibleWaterAmounts.add(currentWater);
      }
      if (currentSolute <= paramF) {
        possibleSoluteAmounts.add(currentSolute);
      }
    }
  }

  var waterOptions = Array.from(possibleWaterAmounts);
  var soluteOptions = Array.from(possibleSoluteAmounts);

  // Evaluate combinations of water and solute to find the highest concentration
  for (var idxC = 0; idxC < waterOptions.length; idxC++) {
    for (var idxD = 0; idxD < soluteOptions.length; idxD++) {
      var currentWater = waterOptions[idxC];
      var currentSolute = soluteOptions[idxD];

      if (currentWater + currentSolute <= paramF && verifySoluteLimit(currentWater, currentSolute, paramE)) {
        var totalMixture = currentWater + currentSolute;
        if (totalMixture === 0) {
          continue;
        }
        var currentConcentration = currentSolute * 100 / totalMixture;

        if (currentConcentration > highestConcentration) {
          highestConcentration = currentConcentration;
          resultPair[0] = totalMixture;
          resultPair[1] = currentSolute;
        }
      }
    }
  }

  printResult(performConversion(resultPair, 8));
}

function verifySoluteLimit(waterAmount, soluteAmount, maxConcentrationFactor) {
  var maxAllowedSolute = waterAmount / 100 * maxConcentrationFactor;
  return maxAllowedSolute >= soluteAmount;
}
