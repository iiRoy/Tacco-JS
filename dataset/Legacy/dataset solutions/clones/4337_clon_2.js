var inputHandler = initializeInputProcessor();
executeMainLogic();

function getNextInteger() {
  return convertInput(fetchNextLine(), 1);
}

function getNextStringArray() {
  // Splits input by half-width space
  return convertInput(fetchNextLine(), 2);
}

function getNextIntegerArray() {
  // Splits by half-width space and converts to numbers
  return convertInput(fetchNextLine(), 4);
}

function getNextCharacterArray() {
  // Splits into individual characters
  return convertInput(fetchNextLine(), 6);
}

function fetchNextLine() {
  return inputHandler.fetchLine();
}

function hasMoreInput() {
  return inputHandler.checkMore();
}

function readStandardInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeInputProcessor() {
  var rawInputLines = readStandardInput();
  var processorInstance = {
    inputLines: rawInputLines,
    currentLineIndex: 0,
    totalLines: rawInputLines.length,
    checkMore: function() {
      return (this.currentLineIndex < this.totalLines);
    },
    fetchLine: function() {
      if (!this.checkMore()) {
        return "";
      } else {
        var currentLineContent = this.inputLines[this.currentLineIndex];
        this.currentLineIndex++;
        return currentLineContent;
      }
    }
  };
  return processorInstance;
}

function printOutput(messageContent) {
  console.log(messageContent);
}

function printError(errorMessage) {
  console.error(errorMessage);
}

// Conversion utility function
// Handles various input transformations based on conversionType.
// If conversionType is unknown or an error occurs, returns inputValue as is.
// 1: Convert to integer
// 2: Split by space
// 4: Split by space and convert to array of numbers
// 6: Split into individual characters
// 7: Split into individual characters and convert to array of numbers
// 8: Join array elements with space
// 9: Join array elements with newline
// 0: Join array elements without separator
function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((element) => Number(element));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((charElement) => Number(charElement));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (errorObject) {
    return inputValue;
  }
}

function executeMainLogic() {
  var dimensionsArray = getNextIntegerArray();
  var heightValue = dimensionsArray[0];
  var widthValue = dimensionsArray[1];

  var characterCounts = {};

  for (var rowIterator = 0; rowIterator < heightValue; rowIterator++) {
    var currentRowChars = getNextCharacterArray();
    for (var colIterator = 0; colIterator < widthValue; colIterator++) {
      if (characterCounts[currentRowChars[colIterator]] == null) {
        characterCounts[currentRowChars[colIterator]] = 1;
      } else {
        characterCounts[currentRowChars[colIterator]]++;
      }
    }
  }

  var countFourBlocks = 0;
  var countTwoBlocks = 0;
  var countOneBlock = 0;

  var halfHeightCeil = Math.ceil(heightValue / 2);
  var halfWidthCeil = Math.ceil(widthValue / 2);

  printError("halfHeightCeil : " + halfHeightCeil);
  printError("halfWidthCeil : " + halfWidthCeil);

  if (heightValue % 2 === 1 && widthValue % 2 === 1) {
    countFourBlocks = (halfHeightCeil - 1) * (halfWidthCeil - 1);
    countTwoBlocks = (halfHeightCeil - 1) + (halfWidthCeil - 1);
    countOneBlock = 1;
  } else if (heightValue % 2 === 1 && widthValue % 2 !== 1) {
    countFourBlocks = halfWidthCeil * (halfHeightCeil - 1);
    countTwoBlocks = halfWidthCeil;
  } else if (heightValue % 2 !== 1 && widthValue % 2 === 1) {
    countFourBlocks = halfHeightCeil * (halfWidthCeil - 1);
    countTwoBlocks = halfHeightCeil;
  } else {
    countFourBlocks = halfHeightCeil * halfWidthCeil;
  }

  var uniqueCharacters = Object.keys(characterCounts);

  var foundMatch = false;

  while (countFourBlocks > 0) {
    foundMatch = false; // Reset for each block type
    for (var keyIndex = 0; keyIndex < uniqueCharacters.length; keyIndex++) {
      if (characterCounts[uniqueCharacters[keyIndex]] >= 4) {
        characterCounts[uniqueCharacters[keyIndex]] -= 4;
        countFourBlocks--;
        foundMatch = true;
        break; // Found a match, move to next four-block
      }
    }
    if (!foundMatch) {
      printOutput("No");
      return;
    }
  }

  while (countTwoBlocks > 0) {
    foundMatch = false; // Reset for each block type
    for (var keyIndex = 0; keyIndex < uniqueCharacters.length; keyIndex++) {
      if (characterCounts[uniqueCharacters[keyIndex]] >= 2) {
        characterCounts[uniqueCharacters[keyIndex]] -= 2;
        countTwoBlocks--;
        foundMatch = true;
        break; // Found a match, move to next two-block
      }
    }
    if (!foundMatch) {
      printOutput("No");
      return;
    }
  }

  while (countOneBlock > 0) {
    foundMatch = false; // Reset for each block type
    for (var keyIndex = 0; keyIndex < uniqueCharacters.length; keyIndex++) {
      if (characterCounts[uniqueCharacters[keyIndex]] >= 1) {
        characterCounts[uniqueCharacters[keyIndex]] -= 1;
        countOneBlock--;
        foundMatch = true;
        break; // Found a match, move to next one-block
      }
    }
    if (!foundMatch) {
      printOutput("No");
      return;
    }
  }

  printOutput("Yes");
}
