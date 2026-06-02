function processInputData(rawData) {
  const lineSegments = rawData.split('\n');
  const elementCount = Number(lineSegments[0]);
  const numericalSequence = lineSegments[1].split(' ').map(Number);

  const { oddQuantity, fourMultipleQuantity } = numericalSequence.reduce((accumulator, currentNumber) => {
    if (currentNumber % 2 !== 0) {
      accumulator.oddQuantity++;
    } else if (currentNumber % 4 === 0) {
      accumulator.fourMultipleQuantity++;
    }
    return accumulator;
  }, { oddQuantity: 0, fourMultipleQuantity: 0 });

  const finalVerdict = (
    oddQuantity === 0 ||
    oddQuantity <= fourMultipleQuantity ||
    (elementCount === 3 && oddQuantity <= fourMultipleQuantity + 1 && fourMultipleQuantity > 0)
  ) ? "Yes" : "No";

  console.log('%s', finalVerdict);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
