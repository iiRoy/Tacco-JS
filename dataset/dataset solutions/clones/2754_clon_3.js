function processInputData(rawData) {
  const inputLines = rawData.split("\n");
  const dataElementsString = inputLines[1];
  let numericSequence = dataElementsString.split(" ").map(Number);

  const findMinExcludingEnds = (sequenceArray) => {
    if (sequenceArray.length <= 2) {
      return [Infinity, -1];
    }
    
    const temporarySequenceCopy = sequenceArray.slice(); 
    
    const EXCLUSION_SENTINEL_VALUE = 1e9 + 7; 
    
    temporarySequenceCopy[0] = EXCLUSION_SENTINEL_VALUE;
    temporarySequenceCopy[temporarySequenceCopy.length - 1] = EXCLUSION_SENTINEL_VALUE;
    
    const minimumElementValue = Math.min(...temporarySequenceCopy);
    const minimumElementIndex = temporarySequenceCopy.indexOf(minimumElementValue);
    
    return [minimumElementValue, minimumElementIndex];
  };

  while (numericSequence.length > 2) {
    const [currentMinimumValue, currentMinimumIndex] = findMinExcludingEnds(numericSequence);

    const previousElement = numericSequence[currentMinimumIndex - 1];
    const centralElement = numericSequence[currentMinimumIndex];
    const subsequentElement = numericSequence[currentMinimumIndex + 1];
    
    numericSequence[currentMinimumIndex - 1] = previousElement + centralElement;
    numericSequence[currentMinimumIndex + 1] = subsequentElement + centralElement;
    
    numericSequence.splice(currentMinimumIndex, 1);
  }

  const finalResultSum = numericSequence[0] + numericSequence[1];
  console.log(finalResultSum);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
