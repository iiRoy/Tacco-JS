function processInputData(rawData) {
  const inputLines = rawData.split('\n');
  const upperLimit = Number(inputLines[0]);
  const rawNumbers = inputLines[1].split(' ');

  const processedValues = rawNumbers.slice(0, upperLimit - 1).map(Number);

  const valueCounts = processedValues.reduce((accumulator, currentVal) => {
    accumulator[currentVal] = (accumulator[currentVal] || 0) + 1;
    return accumulator;
  }, {});

  for (let currentTarget = 1; currentTarget <= upperLimit; currentTarget++) {
    console.log(valueCounts[currentTarget] || 0);
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
