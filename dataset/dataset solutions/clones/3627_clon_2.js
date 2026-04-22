function processInputData(rawTextInput) {
  rawTextInput = rawTextInput.split("\n");

  const targetNumericValue = parseInt(rawTextInput[0], 10);

  let calculatedOutput = 0; 
  let currentInteger = 0;

  const ITERATION_UPPER_BOUND = Math.pow(10, 9);

  let currentBinaryRepresentation = ''; 

  for (currentInteger = 0; currentInteger < ITERATION_UPPER_BOUND; currentInteger++) {
    currentBinaryRepresentation = currentInteger.toString(2);

    let powerSum = 0;

    for (let positionIndex = 0; positionIndex < currentBinaryRepresentation.length; positionIndex++) {
      if (currentBinaryRepresentation[positionIndex] === '0') {
        continue;
      }
      powerSum += Math.pow(-2, positionIndex);
    }

    if (powerSum === targetNumericValue) {
      calculatedOutput = currentBinaryRepresentation; 
      break;
    }
  }

  console.log(currentBinaryRepresentation.split("").reverse().join(""));
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));