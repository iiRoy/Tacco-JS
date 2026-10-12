function processGameInput(rawText) {
  const numericValues = rawText.split('\n').slice(1).map(Number);

  const { totalSumAccumulator, nonOneSumAccumulator, allValuesAreOneFlag } = numericValues.reduce((accumulator, currentElement) => {
    accumulator.totalSumAccumulator += currentElement;
    if (currentElement !== 1) {
      accumulator.nonOneSumAccumulator += currentElement;
      accumulator.allValuesAreOneFlag = false;
    }
    return accumulator;
  }, { totalSumAccumulator: 0, nonOneSumAccumulator: 0, allValuesAreOneFlag: true });

  let finalOutcomeParity;

  if (allValuesAreOneFlag) {
    finalOutcomeParity = 1;
  } else if (nonOneSumAccumulator % 2 === 1) {
    finalOutcomeParity = 1;
  } else {
    finalOutcomeParity = totalSumAccumulator % 2;
  }

  if (finalOutcomeParity === 1) {
    console.log("first");
  } else {
    console.log("second");
  }
}

processGameInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
