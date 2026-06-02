function ProcessInput(rawData) {
  const sourceLines = rawData.split("\n");
  const upperBoundary = parseInt(sourceLines[0], 10);
  const requiredNonZeroDigits = parseInt(sourceLines[1], 10);

  const finalTally = Array.from({ length: upperBoundary }, (_, index) => index + 1)
    .filter(currentValue => {
      const digitCharacters = String(currentValue).split('');
      const nonZeroDigitCount = digitCharacters.filter(char => char !== '0').length;
      return nonZeroDigitCount === requiredNonZeroDigits;
    })
    .length;

  console.log(finalTally);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
