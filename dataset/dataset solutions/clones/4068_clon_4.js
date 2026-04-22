function evaluateNumericalProductParity(sourceText) {
    const valuesAsStrings = sourceText.match(/\d+/g);
    const firstFactor = Number(valuesAsStrings[0]);
    const secondFactor = Number(valuesAsStrings[1]);

    const firstFactorParity = firstFactor % 2;
    const secondFactorParity = secondFactor % 2;

    const aggregateParity = (firstFactorParity * secondFactorParity) % 2;

    const resultOptions = ['Odd', 'Even'];
    console.log(resultOptions[aggregateParity]);
}

evaluateNumericalProductParity(require('fs').readFileSync('/dev/stdin', 'utf8'));