function processInput(rawData) {
  const limitVal = Number(rawData);

  const calculateArithmeticSeriesSum = (upperBound) => {
    return upperBound * (upperBound + 1) / 2;
  };

  const calculateSumOfMultiples = (factor, maximumValue) => {
    const multipleCount = Math.floor(maximumValue / factor);
    return factor * calculateArithmeticSeriesSum(multipleCount);
  };

  const totalSumAllNumbers = calculateArithmeticSeriesSum(limitVal);
  const sumOfMultiplesOfThree = calculateSumOfMultiples(3, limitVal);
  const sumOfMultiplesOfFive = calculateSumOfMultiples(5, limitVal);
  const sumOfMultiplesOfFifteen = calculateSumOfMultiples(15, limitVal);

  const finalResult = totalSumAllNumbers - sumOfMultiplesOfThree - sumOfMultiplesOfFive + sumOfMultiplesOfFifteen;

  console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
