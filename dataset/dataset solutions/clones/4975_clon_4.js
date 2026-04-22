'use strict'

function recursiveSummation(indexPos, previousSegmentNumerical, priorTotal, parsedDigits) {
  if (indexPos === parsedDigits.length) {
    return priorTotal + previousSegmentNumerical;
  }

  let cumulativeExpressions = 0;

  // Option A: Extend the current number segment
  const nextNumeral = parsedDigits[indexPos];
  const extendedSegment = previousSegmentNumerical * 10 + nextNumeral;
  cumulativeExpressions += recursiveSummation(indexPos + 1, extendedSegment, priorTotal, parsedDigits);

  // Option B: Start a new number segment (effectively inserting a plus sign)
  cumulativeExpressions += recursiveSummation(indexPos + 1, nextNumeral, priorTotal + previousSegmentNumerical, parsedDigits);

  return cumulativeExpressions;
}

function processNumericString(textualEntry) {
  const cleanInput = textualEntry.trim();
  const digitCollection = cleanInput.split('').map(Number);

  if (digitCollection.length === 0) {
    console.log(0);
    return;
  }

  const initialNumeral = digitCollection[0];
  const overallSum = recursiveSummation(1, initialNumeral, 0, digitCollection);
  
  console.log(overallSum);
}

const getFileSystem = require("fs");
const readInputFile = "/dev/stdin";
const rawData = getFileSystem.readFileSync(readInputFile, "utf8");

processNumericString(rawData);