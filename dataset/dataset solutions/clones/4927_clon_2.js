var inputProcessor = initializeInputHandler();
executePrimaryLogic();

function retrieveInteger() {
  return transformValue(fetchNextLine(), 1);
}

function retrieveStringArray() {
  return transformValue(fetchNextLine(), 2);
} // Splits by space

function retrieveIntegerArray() {
  return transformValue(fetchNextLine(), 4);
} // Splits by space and converts to numbers

function retrieveCharacterArray() {
  return transformValue(fetchNextLine(), 6);
} // Splits into individual characters

function fetchNextLine() {
  return inputProcessor.advanceAndFetch();
}

function hasMoreLines() {
  return inputProcessor.checkAvailability();
}

function readInputFile() {
  // Reads standard input, trims whitespace, and splits by newline.
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeInputHandler() {
  var rawInputData = readInputFile();
  var handlerInstance = {
    lineCollection: rawInputData,
    currentPosition: 0,
    maximumLines: rawInputData.length,
    checkAvailability: function() {
      return this.currentPosition < this.maximumLines;
    },
    advanceAndFetch: function() {
      if (!this.checkAvailability()) {
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        var currentLineContent = this.lineCollection[this.currentPosition];
        this.currentPosition++;
        return currentLineContent;
      }
    }
  };
  return handlerInstance;
}

function displayOutput(content) {
  console.log(content);
} // Prints to standard output

function reportError(message) {
  console.error(message);
} // Prints to standard error output

// This function handles various data transformations based on the 'conversionType' parameter.
// 'inputValue' is the data to be transformed.
// 'conversionType' specifies the desired transformation:
// 1: Convert to integer.
// 2: Split string by spaces into an array of strings.
// 4: Split string by spaces and convert each part to a number.
// 6: Split string into an array of individual characters.
// 7: Split string into characters and convert each to a number.
// 8: Join array elements with spaces.
// 9: Join array elements with newlines.
// 0: Join array elements without any separator.
// Default: Return 'inputValue' unchanged if 'conversionType' is unknown or an error occurs.
function transformValue(inputValue, conversionType) {
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
        return inputValue.split("").map((element) => Number(element));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (error) {
    return inputValue;
  }
}

function executePrimaryLogic() {
  var inputString = fetchNextLine();
  var resultValue = 0;

  for (var loopCounter = 0; loopCounter < inputString.length; loopCounter++) {
    if (loopCounter % 2 === 0 && loopCounter !== inputString.length - 1) {
      if (inputString[loopCounter] === "g") {
        resultValue++;
      }
    } else {
      if (inputString[loopCounter] === "p") {
        resultValue--;
      }
    }
  }
  displayOutput(resultValue);
}
