const rawLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

function printToConsole(content) {
  console.log(content);
}

function printToError(content) {
  console.error(content);
}

function splitStringIntoChars(inputString) {
  return inputString.split("");
}

function processInput() {
  const charSequence = splitStringIntoChars(rawLines[0]);
  const sequenceLength = charSequence.length;

  const distinctChars = new Set(charSequence);
  if (distinctChars.size <= 1) {
    printToConsole(0);
    return;
  }

  let minimumOperations = sequenceLength;

  for (const targetChar of distinctChars) {
    const nextCharDistances = new Array(sequenceLength);
    let lastTargetCharIndex = -1;

    for (let currentIdx = sequenceLength - 1; currentIdx >= 0; currentIdx--) {
      if (charSequence[currentIdx] === targetChar) {
        lastTargetCharIndex = currentIdx;
      }
      nextCharDistances[currentIdx] = (lastTargetCharIndex === -1) ? sequenceLength : (lastTargetCharIndex - currentIdx);
    }

    let maxRequiredPropagationDistance = 0;
    for (let prefixEndIdx = 0; prefixEndIdx < sequenceLength; prefixEndIdx++) {
      maxRequiredPropagationDistance = Math.max(maxRequiredPropagationDistance, nextCharDistances[prefixEndIdx]);
      
      const currentOperationsCount = Math.max(maxRequiredPropagationDistance, sequenceLength - (prefixEndIdx + 1));
      
      minimumOperations = Math.min(minimumOperations, currentOperationsCount);
    }
  }

  printToConsole(minimumOperations);
}

processInput();
