function main(inputStringData) {
  const lineStrings = inputStringData.split('\n');

  const createNumericPair = (valueStr) => {
    const parsedNumber = Number(valueStr);
    if (parsedNumber % 10 === 0) {
      return [parsedNumber, 10];
    }
    return [parsedNumber, parsedNumber % 10];
  };

  const processedNumericEntries = lineStrings.map(createNumericPair);

  processedNumericEntries.sort((entryA, entryB) => entryA[1] - entryB[1]);

  let finalAccumulatedSum = 0;

  if (processedNumericEntries.length > 0) {
    const firstItem = processedNumericEntries[0];
    finalAccumulatedSum += firstItem[0];

    const calculateRoundedUpValue = (originalVal) => {
      const divisionResult = originalVal / 10;
      const ceilingResult = Math.ceil(divisionResult);
      return ceilingResult * 10;
    };

    for (let k = 1; k < processedNumericEntries.length; k++) {
      const currentItem = processedNumericEntries[k];
      const originalNumericValue = currentItem[0];
      finalAccumulatedSum += calculateRoundedUpValue(originalNumericValue);
    }
  }

  console.log(finalAccumulatedSum);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
