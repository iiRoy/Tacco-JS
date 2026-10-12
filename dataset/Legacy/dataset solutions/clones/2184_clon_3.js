function countNonZeroDigits(numberToExamine) {
  const DECIMAL_RADIX = 10;
  return String(numberToExamine).split('').reduce((accumulator, digitChar) => {
    const digitValue = Number.parseInt(digitChar, DECIMAL_RADIX);
    return accumulator + (digitValue !== 0 ? 1 : 0);
  }, 0);
}

function processData(rawInputString) {
  const inputLines = rawInputString.split("\n");

  const DECIMAL_RADIX = 10;

  const upperLimit = Number.parseInt(inputLines[0], DECIMAL_RADIX);
  const requiredNonZeroCount = Number.parseInt(inputLines[1], DECIMAL_RADIX);

  let finalCount = 0;

  for (let currentNumber = 1; currentNumber <= upperLimit; currentNumber++) {
    const nonZeroDigitTally = countNonZeroDigits(currentNumber);

    if (nonZeroDigitTally === requiredNonZeroCount) {
      finalCount++;
    }
  }
  console.log(finalCount);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
