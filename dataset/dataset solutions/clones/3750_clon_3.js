function processInputData(rawDataLines) {
  const parsedNumbers = rawDataLines[0].split(" ");

  const baseValue = 100;
  const exponentString = parsedNumbers[0];
  const multiplierString = parsedNumbers[1];

  const exponentNumeric = parseFloat(exponentString);
  const multiplierNumeric = parseFloat(multiplierString);

  const powerCalculationResult = Math.pow(baseValue, exponentNumeric);
  const productCalculationResult = powerCalculationResult * multiplierNumeric;
  const finalRoundedValue = Math.round(productCalculationResult);

  console.log('%d', finalRoundedValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
