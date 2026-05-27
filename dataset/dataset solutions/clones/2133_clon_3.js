function processInputData(rawInputString) {
  const inputParts = rawInputString.split(' ');

  const [decimalNumberString, baseString] = inputParts;

  let currentNumberValue = Number(decimalNumberString);
  const conversionBase = Number(baseString);

  let calculatedDigitCount = 0;

  if (currentNumberValue === 0) {
    calculatedDigitCount = 0;
  } else {
    while (currentNumberValue > 0) {
      calculatedDigitCount++;

      const divisionQuotient = currentNumberValue / conversionBase;
      currentNumberValue = Math.floor(divisionQuotient);
    }
  }

  console.log(calculatedDigitCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
