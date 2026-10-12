function assessParameters(inputString) {
    const numericValues = inputString.match(/\d+/g).map(val => parseInt(val, 10));
    const primaryValue = numericValues[0];
    const secondaryValue = numericValues[1];

    const threshold = (secondaryValue * 2) - 1;

    const resultIndicator = primaryValue >= threshold ? "YES" : "NO";
    console.log(resultIndicator);
}

assessParameters(require('fs').readFileSync('/dev/stdin', 'utf8'));
