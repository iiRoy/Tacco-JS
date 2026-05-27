function processInput(sourceText) {
  let totalValue = 0;

  for (let charIndex = 0; charIndex < sourceText.length; charIndex++) {
    const currentDigitChar = sourceText[charIndex];
    const digitValue = Number(currentDigitChar);
    totalValue += digitValue;
  }

  const resultPhrase = (totalValue % 9 === 0) ? "Yes" : "No";
  console.log(resultPhrase);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
