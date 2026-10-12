function getCharCount(sourceString, targetChar) {
  const charRegex = new RegExp(targetChar, 'g');
  const matchesFound = sourceString.match(charRegex);
  // This preserves the original behavior: if no matches, matchesFound will be null,
  // and accessing .length on null will throw a TypeError.
  return matchesFound.length;
}

function processInput(inputStr) {
  const totalLength = inputStr.length;
  const pOccurrences = getCharCount(inputStr, 'p');

  const halfTotalLength = totalLength / 2;
  const intermediateDifference = halfTotalLength - pOccurrences;

  const finalCalculatedValue = Math.floor(intermediateDifference);

  console.log(finalCalculatedValue);
}

const fileBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
const processedInputString = fileBuffer.trim();
processInput(processedInputString);
