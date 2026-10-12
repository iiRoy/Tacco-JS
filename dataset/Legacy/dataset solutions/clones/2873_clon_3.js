dbgFlag = false;

function outputDebugMessage() {
  if (dbgFlag) {
    const messageParts = Array.from(arguments);
    console.log(messageParts.join(', '));
  }
}

function processInputData(rawData) {
  const inputLines = rawData.split("\n");
  const firstLineParts = inputLines[0].split(" ");

  const [numElementsStr, startAStr, startBStr, endCStr, endDStr] = firstLineParts;

  const numElements = Number(numElementsStr);
  const startA = Number(startAStr);
  const startB = Number(startBStr);
  const endC = Number(endCStr);
  const endD = Number(endDStr);
  const inputString = inputLines[1];

  outputDebugMessage(numElements, startA, startB, endC, endD, inputString);

  let resultFlag = true;

  if (endC > endD) {
    let effectiveEnd = endD;
    const diffCE = endC - endD;
    if (diffCE <= 3) {
      effectiveEnd = endC;
    }

    let modifiedString = inputString;
    const charBeforeDEnd = inputString[endD - 2];

    if (charBeforeDEnd === '#') {
      outputDebugMessage(modifiedString, modifiedString[endD - 1]);
      modifiedString = modifiedString.substring(0, endD - 1) + '#' + modifiedString.substring(endD);
    }
    outputDebugMessage(modifiedString);

    const subStringForTripleDotCheck = modifiedString.substring(startB - 1, effectiveEnd);
    outputDebugMessage(subStringForTripleDotCheck, resultFlag);

    const hasTripleDot = (/\.\.\./).test(subStringForTripleDotCheck);
    resultFlag = resultFlag && hasTripleDot;
    outputDebugMessage(subStringForTripleDotCheck, resultFlag);
  }

  const segmentStartA = startA - 1;
  const segmentEndC = endC;
  const segmentAC = inputString.substring(segmentStartA, segmentEndC);
  const hasDoubleHashAC = (/##/).test(segmentAC);
  resultFlag = resultFlag && !hasDoubleHashAC;
  outputDebugMessage(segmentAC, resultFlag);

  const segmentStartB = startB - 1;
  const segmentEndD = endD;
  const segmentBD = inputString.substring(segmentStartB, segmentEndD);
  const hasDoubleHashBD = (/##/).test(segmentBD);
  resultFlag = resultFlag && !hasDoubleHashBD;
  outputDebugMessage(segmentBD, resultFlag);

  const finalAnswer = resultFlag ? 'Yes' : 'No';
  console.log(finalAnswer);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
