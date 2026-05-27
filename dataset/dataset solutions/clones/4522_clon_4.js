function processInput(sourceData) {
  const lineSegments = sourceData.split('\n');
  const numberStrings = lineSegments[0].match(/\d+/g);

  const numericValues = numberStrings.map(Number);

  const multipliers = [100, 10, 1];

  const computedSum = numericValues.reduce((accumulator, currentNumber, index) => {
    return accumulator + currentNumber * multipliers[index];
  }, 0);

  const resultIndicator = (computedSum % 4 === 0) ? 'YES' : 'NO';

  console.log(resultIndicator);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
