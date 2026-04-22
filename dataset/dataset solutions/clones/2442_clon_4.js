const processNumericString = (numericText) => {
  const numericValue = Number(numericText);
  const bitShifted = numericValue >> 1;
  const parityBit = numericValue & 1;
  const calculatedResult = bitShifted - (1 - parityBit);
  console.log(calculatedResult);
};

const fileSystemModule = require("fs");
const inputBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");
processNumericString(inputBuffer.trim());