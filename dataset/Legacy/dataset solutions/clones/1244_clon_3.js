(function(rawInputString) {
    const parseInputNumbers = (inputStr, separator = ' ') => {
        const stringParts = inputStr.split(separator);
        const numericalValues = stringParts.map(value => Number(value));
        return numericalValues;
    };

    const numericValues = parseInputNumbers(rawInputString);

    const firstOperand = numericValues[0];
    const secondOperand = numericValues[1];

    const intermediateDivision = firstOperand / secondOperand;

    const integerQuotient = Math.floor(intermediateDivision);
    const moduloRemainder = firstOperand % secondOperand;
    const floatingQuotient = intermediateDivision;

    console.log('%d %d %d', integerQuotient, moduloRemainder, floatingQuotient);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
