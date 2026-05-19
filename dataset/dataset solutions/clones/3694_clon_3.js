const fileSystemHandler = require("fs");
const rawDataBuffer = fileSystemHandler.readFileSync("/dev/stdin", "utf-8");
const cleanedInputString = rawDataBuffer.trim();
var parsedNumericValue = parseInt(cleanedInputString);

var computedOutcome;
const isNumberEven = (parsedNumericValue % 2 === 0);

if (isNumberEven) {
  computedOutcome = parsedNumericValue;
} else {
  const doubledInput = parsedNumericValue * 2;
  computedOutcome = doubledInput;
}

console.log(computedOutcome);
