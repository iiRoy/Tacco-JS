function fetchEntryData() {
 return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}
function displayResult(finalValue) {
 console.log(finalValue);
}

/*
 * This helper function performs various transformations on input data.
 *
 * Supported Transformation Modes:
 *  Mode 0: Returns the data unmodified.
 *  Mode 1: Converts the data into an integer.
 *  Mode 2: Splits the string by space characters.
 *  Mode 3: Divides the string by newline characters.
 *  Mode 4: Splits by spaces, then converts each part to a numeric value.
 *  Mode 5: Splits by newlines, then converts each part to a numeric value.
 *  Mode 6: Breaks the string into an array of individual characters.
 *  Mode 7: Breaks into characters, then converts each character to a number.
 */
function processInput(inputSegment, conversionMode) {
 switch (conversionMode) {
  case 0: return inputSegment;
  case 1: return Number.parseInt(inputSegment, 10);
  case 2: return inputSegment.split(" ");
  case 3: return inputSegment.split("\n");
  case 4: return inputSegment.split(" ").map((itemValue) => Number(itemValue));
  case 5: return inputSegment.split("\n").map((itemValue) => Number(itemValue));
  case 6: return inputSegment.split("");
  case 7: return inputSegment.split("").map((itemValue) => Number(itemValue));
 }
}

function performPrimaryTask(rawInputContent) {
 rawInputContent = processInput(rawInputContent, 3);
 let totalElementsCount = processInput(rawInputContent[0], 1);
 let numericSequence = processInput(rawInputContent[1], 4);
 let cumulativeProductSum = 0;

 for (let outerPosition = 0; outerPosition < totalElementsCount - 1; outerPosition++) {
  for (let innerPosition = outerPosition + 1; innerPosition < totalElementsCount; innerPosition++) {
   cumulativeProductSum += numericSequence[outerPosition] * numericSequence[innerPosition];
  }
 }
 displayResult(cumulativeProductSum);
}

performPrimaryTask(fetchEntryData());