function processInputString(sourceText) {
  const patternTripleR = 'RRR';
  const patternDoubleR = 'RR';
  const patternSingleR = 'R';

  let finalDetectionValue = 0;

  if (sourceText.includes(patternTripleR)) {
    finalDetectionValue = 3;
  } else if (sourceText.includes(patternDoubleR)) {
    finalDetectionValue = 2;
  } else if (sourceText.includes(patternSingleR)) {
    finalDetectionValue = 1;
  }
  // If none of the above, finalDetectionValue remains 0.

  console.log(finalDetectionValue);
}

const fileSystemAccess = require("fs");
const standardInputFile = "/dev/stdin";
const textEncoding = "utf8";

const inputDataBuffer = fileSystemAccess.readFileSync(standardInputFile, textEncoding);
processInputString(inputDataBuffer);
