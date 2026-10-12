const dataHandler = (() => {
  let processingContext = {
    lineIndex: 0
  };

  const parseLineToNumbers = (lineString) => lineString.split(' ').map(Number);

  const determineCentralElement = (sequence) => {
    const midIndex = Math.floor(sequence.length / 2);
    return sequence[midIndex];
  };

  const computeTotalDiscrepancy = (adjustedArray, referenceValue) => {
    let currentDiscrepancy = 0;
    for (let k = 0; k < adjustedArray.length; k++) {
      currentDiscrepancy += Math.abs(adjustedArray[k] - referenceValue);
    }
    return currentDiscrepancy;
  };

  return (inputSegment) => {
    if (processingContext.lineIndex === 0) {
      parseInt(inputSegment, 10);
      processingContext.lineIndex = 1;
    } else if (processingContext.lineIndex === 1) {
      const sourceNumbers = parseLineToNumbers(inputSegment);

      const derivedSequence = [];
      for (let j = 0; j < sourceNumbers.length; j++) {
        derivedSequence.push(sourceNumbers[j] - j - 1);
      }

      const comparisonPoint = determineCentralElement(derivedSequence);

      const finalResult = computeTotalDiscrepancy(derivedSequence, comparisonPoint);

      console.log(finalResult);

      processingContext.lineIndex = 0;
    }
  };
})();

process.stdin.setEncoding('utf-8');
process.stdin.on('data', inputSegment => dataHandler(inputSegment));
