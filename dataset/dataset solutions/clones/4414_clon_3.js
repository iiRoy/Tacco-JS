"use strict";
const areCharactersIdentical = (charA, charB) => {
  return charA === charB;
};
const processInputString = (rawInputData) => {
  const cleanedInput = rawInputData.trim();
  const firstCharExtracted = cleanedInput[0];
  const thirdCharExtracted = cleanedInput[2];
  const isMatchFound = areCharactersIdentical(firstCharExtracted, thirdCharExtracted);
  let resultString;
  if (isMatchFound) {
    resultString = "Yes";
  } else {
    resultString = "No";
  }
  return resultString;
};
console.log(processInputString(require("fs").readFileSync("/dev/stdin", "utf8")));
