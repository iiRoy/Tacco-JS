function processInputData(rawData) {
  const inputLines = rawData.split("\n");
  const parsedRows = inputLines.map(lineContent => lineContent.split(" "));

  const DECIMAL_RADIX = 10;

  const firstValue = parseInt(parsedRows[0][0], DECIMAL_RADIX);
  const secondValue = parseInt(parsedRows[0][1], DECIMAL_RADIX);

  const calculateCombinations = (count) => {
    if (count < 2) {
      return 0;
    } else if (count === 2) {
      return 1;
    } else {
      const decrementedCount = count - 1;
      const product = count * decrementedCount;
      return product / 2;
    }
  };

  const resultForFirst = calculateCombinations(firstValue);
  const resultForSecond = calculateCombinations(secondValue);

  console.log(resultForFirst + resultForSecond);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
