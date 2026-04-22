// Internal utility code begins here; these functions support the main application logic.
let inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataProcessor;
let capturedLines = [];

inputHandler.on('line', function (currentLine) {
  capturedLines.push(currentLine);
});

inputHandler.on('close', function () {
  dataProcessor = initializeParser(capturedLines);
  console.warn('\n--- Input processing complete, beginning main execution ---');
  executePrimaryLogic();
});

/**
 * Creates a deep clone of an object or Set.
 * @param {any} sourceItem - The item to clone.
 * @returns {any} A deep copy of the source item.
 */
function deepCopyValue(sourceItem) {
  return (sourceItem instanceof Set)
    ? new Set(Array.from(sourceItem))
    : JSON.parse(JSON.stringify(sourceItem));
}

function retrieveInteger() { return convertAndParse(getNextItem(), 1); }

function retrieveStringArray() { return convertAndParse(getNextItem(), 2); }

function retrieveIntegerArray() { return convertAndParse(getNextItem(), 4); }

function retrieveCharacterArray() { return convertAndParse(getNextItem(), 6); }

function getNextItem() { return dataProcessor.getNextItem(); }

function hasMoreItems() { return dataProcessor.hasMoreItems(); }

/**
 * Initializes an input parser object.
 * @param {string[]} inputContent - An array of strings representing input lines.
 * @returns {object} An object with methods to navigate the input.
 */
function initializeParser(inputContent) {
  return {
    contentList: inputContent,
    currentPosition: 0,
    maximumLength: inputContent.length,

    hasMoreItems: function () {
      return (this.currentPosition < this.maximumLength);
    },

    getNextItem: function () {
      if (this.hasMoreItems()) {
        return this.contentList[this.currentPosition++];
      } else {
        throw new Error('NoFurtherInputException: Input stream exhausted.');
      }
    }
  };
}

function displayResult(messageToDisplay) {
  console.log(messageToDisplay);
}

function logDebugInfo(debugObject) {
  console.error('DEBUG_OUTPUT:' + require('util').inspect(debugObject, false, null));
}

// The 'conversionType' parameter specifies the desired transformation for the input value.
//  - Default/Unknown: Returns the input value unchanged.
//  - 1: Parses the input as an integer.
//  - 2: Splits the input string by spaces into an array of strings.
//  - 4: Splits the input string by spaces and converts each part to a number.
//  - 6: Splits the input string into individual characters.
//  - 7: Splits the input string into characters and converts each to a number.
//  - 8: Joins array elements with a single space.
//  - 9: Joins array elements with newline characters.
//  - 0: Joins array elements without any separator.
function convertAndParse(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return Number.parseInt(inputValue);
      case 2:
        return inputValue.split(' ');
      case 4:
        return inputValue.split(' ').map(val => Number(val));
      case 6:
        return inputValue.split('');
      case 7:
        return inputValue.split('').map(val => Number(val));
      case 8:
        return inputValue.join(' ');
      case 9:
        return inputValue.join('\n');
      case 0:
        return inputValue.join('');
      default:
        return inputValue;
    }
  } catch (conversionError) {
    return inputValue; // In case of conversion failure, return original value.
  }
}

// End of internal utility functions --------------------------------------

function executePrimaryLogic() {
  let inputNumbers = retrieveIntegerArray();

  let firstVal = inputNumbers[0];
  let secondVal = inputNumbers[1];
  let thirdVal = inputNumbers[2];
  let fourthVal = inputNumbers[3];
  let fifthVal = inputNumbers[4];
  let sixthVal = inputNumbers[5];
  let seventhVal = inputNumbers[6];

  let calculatedResultA = Math.floor(firstVal / 2) * 2 + Math.floor(fourthVal / 2) * 2 + Math.floor(fifthVal / 2) * 2;
  let calculatedResultB = Math.floor((firstVal - 1) / 2) * 2 + Math.floor((fourthVal - 1) / 2) * 2 + Math.floor((fifthVal - 1) / 2) * 2 + 3;

  displayResult(Math.max(calculatedResultA, calculatedResultB) + secondVal);
}