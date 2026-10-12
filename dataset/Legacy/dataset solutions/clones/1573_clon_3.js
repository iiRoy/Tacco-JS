function processInput(rawData) {
  const characterArray = [...rawData];

  const convertCharToNumber = (charDigit) => {
    return parseInt(charDigit);
  };

  const numericValues = characterArray.map(convertCharToNumber);

  const initialSumValue = 0;
  const totalSum = numericValues.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, initialSumValue);

  const DIVISIBILITY_CHECK_FACTOR = 9;

  const isSumDivisibleByFactor = (totalSum % DIVISIBILITY_CHECK_FACTOR) === 0;

  if (isSumDivisibleByFactor) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
