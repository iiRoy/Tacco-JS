const initiateComputation = (rawData) => {

  const extractNumericalData = (textualInput) => {
    const lines = textualInput.trim().split('\n');
    const firstLineNumbers = lines[0].match(/\d+/g).map(Number);
    const iterationQuantity = firstLineNumbers[1];
    const initialNumericSequence = lines[1].match(/\d+/g).map(Number);
    return { iterationQuantity, initialNumericSequence };
  };

  const { iterationQuantity, initialNumericSequence } = extractNumericalData(rawData);

  const transformSequence = (sequence, rounds) => {
    let activeSequence = [...sequence];

    let currentRound = 0;
    while (currentRound < rounds) {
      activeSequence.sort((valA, valB) => valB - valA);
      activeSequence[0] = Math.floor(activeSequence[0] / 2);
      currentRound++;
    }
    return activeSequence;
  };

  const finalSequence = transformSequence(initialNumericSequence, iterationQuantity);

  const aggregateValues = (collection, currentTotal = 0, index = 0) => {
    if (index >= collection.length) {
      return currentTotal;
    }
    return aggregateValues(collection, currentTotal + collection[index], index + 1);
  };

  const totalResult = aggregateValues(finalSequence);

  console.log(totalResult);
};

initiateComputation(require("fs").readFileSync("/dev/stdin", "utf8"));