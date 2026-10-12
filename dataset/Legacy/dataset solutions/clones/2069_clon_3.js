function processInputData(rawData) {
  const DECIMAL_RADIX = 10;
  const inputParts = rawData.trim().split(" ");

  const firstValue = parseInt(inputParts[0], DECIMAL_RADIX);
  const secondValue = parseInt(inputParts[1], DECIMAL_RADIX);

  let finalOutcome;
  if (firstValue === 1 || secondValue === 1) {
    finalOutcome = 1;
  } else {
    const productOfValues = firstValue * secondValue;
    finalOutcome = Math.ceil(productOfValues / 2);
  }

  console.log(finalOutcome);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
