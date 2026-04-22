var inputProcessor = initializeInput();

executeProgram();

function retrieveInteger() {
  return transformData(fetchNextItem(), 1);
}

function retrieveStringArray() {
  return transformData(fetchNextItem(), 2);
}

function retrieveIntegerArray() {
  return transformData(fetchNextItem(), 4);
}

function retrieveCharacterArray() {
  return transformData(fetchNextItem(), 6);
}

function fetchNextItem() {
  return inputProcessor.fetchNextItem();
}

function hasMoreItems() {
  return inputProcessor.hasMoreItems();
}

function readInputFile() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeInput() {
  var rawLines = readInputFile();
  var processorInstance = {
    "dataLines": rawLines,
    "currentPosition": 0,
    "totalLines": rawLines.length,
    "hasMoreItems": function() {
      return (this.currentPosition < this.totalLines);
    },
    "fetchNextItem": function() {
      if (!this.hasMoreItems()) {
        throw "InputBoundaryExceeded: No more data available for processing.";
      } else {
        var currentLineContent = this.dataLines[this.currentPosition];
        this.currentPosition++;
        return currentLineContent;
      }
    }
  };
  return processorInstance;
}

function displayOutput(textToDisplay) {
  console.log(textToDisplay);
}

function displayError(errorText) {
  console.error(errorText);
}

// This utility function handles various data format transformations.
// The 'conversionType' parameter dictates the specific operation.
// Default/Unknown: Returns the input as-is.
// 1: Parses the input into an integer.
// 2: Splits the input string by spaces into a string array.
// 4: Splits by spaces and converts each part to a number, forming an array.
// 6: Splits the input string into an array of individual characters.
// 7: Splits into characters and converts each to a number.
// 8: Joins array elements with a space.
// 9: Joins array elements with a newline.
// 0: Joins array elements without any separator.
function transformData(inputData, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputData);
      case 2:
        return inputData.split(" ");
      case 4:
        return inputData.split(" ").map((val) => Number(val));
      case 6:
        return inputData.split("");
      case 7:
        return inputData.split("").map((val) => Number(val));
      case 8:
        return inputData.join(" ");
      case 9:
        return inputData.join("\n");
      case 0:
        return inputData.join("");
      default:
        return inputData;
    }
  } catch (errorDetails) {
    return inputData; // In case of conversion error, return original input
  }
}

function executeProgram() {
  var firstLineData = retrieveIntegerArray();
  var targetHealth = firstLineData[0];
  var spellCount = firstLineData[1];

  var spellList = new Array(spellCount);
  for (var loopIndex = 0; loopIndex < spellCount; loopIndex++) {
    var tempSpellInfo = retrieveIntegerArray();
    spellList[loopIndex] = {
      "spellDamage": tempSpellInfo[0],
      "manaCost": tempSpellInfo[1]
    };
  }

  // Dynamic programming array to store the minimum mana required for a given damage
  var minManaCost = new Array((targetHealth + 1) * 2);
  minManaCost[0] = 0; // Base case: 0 damage requires 0 mana

  // Iterate through each spell and update the minManaCost array
  for (var spellIdx = 0; spellIdx < spellCount; spellIdx++) {
    for (var currentHealth = 0; currentHealth < targetHealth; currentHealth++) {
      if (minManaCost[currentHealth] != null) { // If the current health state is reachable
        var potentialDamage = currentHealth + spellList[spellIdx]["spellDamage"];
        var potentialCost = minManaCost[currentHealth] + spellList[spellIdx]["manaCost"];

        // Update if this damage level hasn't been reached or a cheaper way is found
        if (!minManaCost[potentialDamage]) {
          minManaCost[potentialDamage] = potentialCost;
        } else {
          minManaCost[potentialDamage] = Math.min(minManaCost[potentialDamage], potentialCost);
        }
      }
    }
  }

  var largeConstant = 1000000007; // A sufficiently large value for comparison

  // Initialize a placeholder for an out-of-bounds index if not already set
  if (!minManaCost[targetHealth * 2 + 1]) {
    minManaCost[targetHealth * 2 + 1] = largeConstant;
  }

  // myerr(minManaCost); // Debugging output commented out

  // Post-processing: Ensure that minManaCost[i] is at least minManaCost[i+1].
  // This propagates the minimum cost backwards for higher damage values,
  // effectively considering that higher damage can be achieved with the same or more mana.
  for (var healthIdx = targetHealth * 2; healthIdx >= 0; healthIdx--) {
    if (minManaCost[healthIdx]) {
      minManaCost[healthIdx] = Math.min(minManaCost[healthIdx], minManaCost[healthIdx + 1]);
    } else {
      minManaCost[healthIdx] = minManaCost[healthIdx + 1];
    }
  }

  // Output the minimum mana cost required to achieve the target health
  displayOutput(minManaCost[targetHealth]);
}