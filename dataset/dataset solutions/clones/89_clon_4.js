(function(sourceData) {
  const parseData = (textualInput) => {
    const linesOfText = textualInput.trim().split('\n');
    let lineIdx = 0;
    const allProblemSets = [];

    while (lineIdx < linesOfText.length) {
      const elementCount = parseInt(linesOfText[lineIdx++], 10);
      if (elementCount === 0) {
        break;
      }
      const currentSequence = [];
      for (let k = 0; k < elementCount; k++) {
        currentSequence.push(parseInt(linesOfText[lineIdx++], 10));
      }
      allProblemSets.push(currentSequence);
    }
    return allProblemSets;
  };

  const determineMaxSubarrayValue = (valueSequence) => {
    if (valueSequence.length === 0) {
      return -Infinity;
    }

    const calculationResult = valueSequence.reduce((accumulatorObject, currentNumber) => {
      const updatedCurrentMax = Math.max(currentNumber, accumulatorObject.runningTotal + currentNumber);
      const updatedOverallMax = Math.max(accumulatorObject.peakValue, updatedCurrentMax);

      return {
        runningTotal: updatedCurrentMax,
        peakValue: updatedOverallMax
      };
    }, { runningTotal: -Infinity, peakValue: -Infinity });

    return calculationResult.peakValue;
  };

  const structuredProblems = parseData(sourceData);

  structuredProblems.forEach(individualSequence => {
    const finalResult = determineMaxSubarrayValue(individualSequence);
    console.log(finalResult);
  });

})(require('fs').readFileSync('/dev/stdin', 'utf8'));