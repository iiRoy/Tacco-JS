function processInputData(rawDataString){
  const lines = rawDataString.split('\n');
  // The variable 'N' from the original input was read but not subsequently used.
  // It is removed here as non-essential code.
  let colorSequence = lines[1].split('');

  let operationCounter = 0;
  let processingActive = true;

  while(processingActive){
    let problematicPairs = locateMisplacedPairs(colorSequence);

    if (problematicPairs.length === 0) {
      processingActive = false;
    } else {
      let firstWhiteIdx = findInitialWhite(colorSequence);
      let lastRedIdx = findTerminalRed(colorSequence);

      // Using a temporary constant to clearly perform the swap operation
      const charToMove = colorSequence[firstWhiteIdx];
      colorSequence[firstWhiteIdx] = colorSequence[lastRedIdx];
      colorSequence[lastRedIdx] = charToMove;

      operationCounter++;
    }
  }

  console.log(operationCounter);
}

function locateMisplacedPairs(sequenceOfColors){
  let foundPairIndices = [];
  const currentSequenceLength = sequenceOfColors.length; // Introduce helper variable
  for(let currentIdx = 0; currentIdx < currentSequenceLength - 1; currentIdx++){
    const charAtCurrent = sequenceOfColors[currentIdx]; // Introduce helper variable
    const charAtNext = sequenceOfColors[currentIdx + 1]; // Introduce helper variable
    if(charAtCurrent === 'W' && charAtNext === 'R'){
      foundPairIndices.push(currentIdx);
    }
  }
  return foundPairIndices;
}

function findInitialWhite(sequenceOfColors){
  const sequenceLen = sequenceOfColors.length; // Introduce helper variable
  for(let currentIdx = 0; currentIdx < sequenceLen; currentIdx++){
    if(sequenceOfColors[currentIdx] === 'W') {
      return currentIdx;
    }
  }
  // The original function implicitly returns undefined if no 'W' is found.
  // Given the problem constraints, a 'W' is always expected to be found when this is called.
}

function findTerminalRed(sequenceOfColors){
  for(let currentIdx = sequenceOfColors.length - 1; currentIdx >= 0; currentIdx--){
    if(sequenceOfColors[currentIdx] === 'R') {
      return currentIdx;
    }
  }
  // The original function implicitly returns undefined if no 'R' is found.
  // Given the problem constraints, an 'R' is always expected to be found when this is called.
}


processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
