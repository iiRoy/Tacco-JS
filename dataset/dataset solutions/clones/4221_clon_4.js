"use strict"

function analyzeSequence(numericInput) {
  const digitsCollection = Array.from(numericInput, Number);
  const operatorOptions = ['+', '-'];

  for (let patternIndex = 0; patternIndex < 8; patternIndex++) {
    const currentOperators = [];
    currentOperators.push(operatorOptions[(patternIndex >> 2) & 1]);
    currentOperators.push(operatorOptions[(patternIndex >> 1) & 1]);
    currentOperators.push(operatorOptions[(patternIndex >> 0) & 1]);

    const expressionText = `${digitsCollection[0]}${currentOperators[0]}${digitsCollection[1]}${currentOperators[1]}${digitsCollection[2]}${currentOperators[2]}${digitsCollection[3]}`;

    const computedValue = eval(expressionText);

    if (computedValue === 7) {
      process.stdout.write(`${expressionText}=7\n`);
      return;
    }
  }
}

analyzeSequence(require("node:fs").readFileSync(0, "utf8").trim());