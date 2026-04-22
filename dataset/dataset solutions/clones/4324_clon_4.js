const processInputData = (sourceText) => {
  return sourceText
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .filter((lineSegment) => lineSegment.length > 0)
    .map((lineSegment) => {
      const numericParts = lineSegment.split(" ");
      return {
        identifier: Number(numericParts[0]),
        value: Number(numericParts[1]),
      };
    });
};

const determineCombinedValue = (recordCollection) => {
  const highestIdentifierRecord = recordCollection.reduce(
    (leadingRecord, currentRecord) => {
      if (currentRecord.identifier > leadingRecord.identifier) {
        return currentRecord;
      }
      return leadingRecord;
    },
    { identifier: Number.MIN_SAFE_INTEGER, value: 0 }
  );
  return highestIdentifierRecord.identifier + highestIdentifierRecord.value;
};

const executeComputation = (inputString) => {
  const structuredData = processInputData(inputString);
  const finalCalculation = determineCombinedValue(structuredData);
  console.log(finalCalculation);
};

executeComputation(require('fs').readFileSync('/dev/stdin', 'utf8'));