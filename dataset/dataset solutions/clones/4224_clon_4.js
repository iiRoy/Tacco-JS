function Main(input) {
  const digitCharacters = input.split("");
  const numericDigits = digitCharacters.map(Number);

  const operatorPositions = numericDigits.length - 1;
  const totalPermutations = 1 << operatorPositions;

  for (let permutationIndex = 0; permutationIndex < totalPermutations; permutationIndex++) {
    let accumulatedValue = numericDigits[0];
    const expressionComponents = [digitCharacters[0]];

    for (let opIndex = 0; opIndex < operatorPositions; opIndex++) {
      const operationChoice = (permutationIndex >> opIndex) & 1;
      const subsequentDigit = numericDigits[opIndex + 1];
      const subsequentDigitChar = digitCharacters[opIndex + 1];

      if (operationChoice === 0) {
        accumulatedValue += subsequentDigit;
        expressionComponents.push("+", subsequentDigitChar);
      } else {
        accumulatedValue -= subsequentDigit;
        expressionComponents.push("-", subsequentDigitChar);
      }
    }

    if (accumulatedValue === 7) {
      console.log(expressionComponents.join("") + "=7");
      return;
    }
  }

  console.log("program error");
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
