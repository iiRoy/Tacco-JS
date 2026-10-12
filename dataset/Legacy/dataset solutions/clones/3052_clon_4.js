function processInputAndCalculate(sourceData) {
  const dataLines = sourceData.split('\n');
  // The first line (N) is not utilized in the original logic for the final count.
  // const elementCount = Number(dataLines[0]);
  const heightSequence = dataLines[1].split(' ').map(strValue => Number(strValue));

  const finalState = heightSequence.reduce((accumulator, currentElevation) => {
    const { peakValue, ascentCount } = accumulator;

    if (currentElevation >= peakValue) {
      return {
        peakValue: currentElevation,
        ascentCount: ascentCount + 1
      };
    } else {
      return accumulator;
    }
  }, { peakValue: 0, ascentCount: 0 });

  console.log(finalState.ascentCount);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
