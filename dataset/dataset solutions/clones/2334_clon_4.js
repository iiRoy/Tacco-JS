function processData(sourceDatum) {
  const initialValue = Math.floor(sourceDatum);

  const calculateFrequency = (upperBound) => {
    const recursiveCounter = (currentNumber, totalCount) => {
      if (currentNumber <= 0) {
        return totalCount;
      }
      const updatedCount = totalCount + (currentNumber % 10 === 0 ? 1 : 0);
      return recursiveCounter(currentNumber - 2, updatedCount);
    };
    return recursiveCounter(upperBound, 0);
  };

  const finalTally = calculateFrequency(initialValue);
  console.log(finalTally);
}

const executeProgram = (dataInput) => {
  processData(dataInput);
};

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));