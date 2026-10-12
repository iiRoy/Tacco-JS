const processInputData = (rawData) => {
  const [firstVal, secondVal, thirdVal] = rawData.trim().split(' ').map(Number);
  const allValues = [firstVal, secondVal, thirdVal];

  const valueFrequencies = allValues.reduce((accumulator, currentNumber) => {
    accumulator.set(currentNumber, (accumulator.get(currentNumber) || 0) + 1);
    return accumulator;
  }, new Map());

  const singleOccurrenceEntry = Array.from(valueFrequencies.entries()).find(
    ([value, frequency]) => frequency === 1
  );

  if (singleOccurrenceEntry) {
    console.log(singleOccurrenceEntry[0]);
  } else {
    console.log(thirdVal);
  }
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
