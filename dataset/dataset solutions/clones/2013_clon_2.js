let sourceReader = initializeReader();
ExecuteProgram();

function readInteger() {
  return dataTransformer(readNextLine(), 1);
}

function readStringArray() {
  return dataTransformer(readNextLine(), 2); /* Splits an input line by single space characters */
}

function readIntegerArray() {
  return dataTransformer(readNextLine(), 4); /* Splits by spaces and converts resulting parts to numbers */
}

function readCharacterArray() {
  return dataTransformer(readNextLine(), 6); /* Breaks down an input line into an array of individual characters */
}

function readNextLine() {
  return sourceReader.readNextLine();
}

function hasMoreLines() {
  return sourceReader.hasMoreLines();
}

function fetchInputData() {
  return require("node:fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeReader() {
  let inputLines = fetchInputData();
  let readerInstance = {
    "lineBuffer" : inputLines,
    "currentLineIndex" : 0,
    "totalLines" : inputLines.length,
    "hasMoreLines" : function() {
      return (this.currentLineIndex < this.totalLines);
    },
    "readNextLine" : function() {
      if (!this.hasMoreLines()) {
        throw "EndOfInputReachedException No more data available";
      } else {
        let currentLineContent = this.lineBuffer[this.currentLineIndex];
        this.currentLineIndex++;
        return currentLineContent;
      }
    }
  };
  return readerInstance;
}

function printOutput(outputValue) {
  console.log(outputValue);
} /* Writes the given value to the standard output stream */

function printError(errorMessage) {
  console.error(errorMessage);
} /* Emits an error message to the standard error stream */

/*
 * Utility function for transforming input values based on a specified type.
 * The 'transformType' parameter determines the conversion or manipulation to perform.
 *
 * Default/Error case: Returns the 'inputValue' without any changes.
 * Type 1: Converts the 'inputValue' to an integer data type.
 * Type 2: Splits the 'inputValue' string using a single space as the delimiter.
 * Type 4: Splits the 'inputValue' by spaces, then converts each resulting part to a number.
 * Type 6: Splits the 'inputValue' string into an array of its individual characters.
 * Type 7: Splits the 'inputValue' into characters, then converts each character to a number.
 * Type 8: Concatenates elements of an array with a single space character in between.
 * Type 9: Concatenates array elements, using a newline character as the separator.
 * Type 0: Concatenates array elements without any separating character.
 */
function dataTransformer(inputValue, transformType) {
  try {
    switch (transformType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((valA) => Number(valA));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((valA) => Number(valA));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (exceptionObject) {
    return inputValue;
  }
}

function ExecuteProgram() {
  let inputNumber = readInteger();
  let resultCounter = 0;
  /*
   * This section is currently commented out, representing alternative program logic.
   *
   * for (let iterationIndex = 2; iterationIndex <= inputNumber; iterationIndex++) {
   *   let temporaryValue = inputNumber;
   *   while (temporaryValue >= iterationIndex) {
   *     if (temporaryValue % iterationIndex === 0) {
   *       temporaryValue /= iterationIndex;
   *     } else {
   *       temporaryValue -= iterationIndex;
   *     }
   *   }
   *   if (temporaryValue === 1) {
   *     printError(iterationIndex);
   *     resultCounter++;
   *   }
   * }
   */
  printOutput(calculateDivisors(inputNumber - 1).length + 1);
}

function calculateDivisors(targetValue) {
  let divisorCollection = [];
  for (let iterationIndex = 1; iterationIndex * iterationIndex <= targetValue; iterationIndex++) {
    if (targetValue % iterationIndex === 0) {
      divisorCollection.push(iterationIndex);
      if (iterationIndex * iterationIndex !== targetValue) {
        divisorCollection.push(targetValue / iterationIndex);
      }
    }
  }
  divisorCollection.sort(function(valA, valB) { return valA - valB; });
  return divisorCollection;
}