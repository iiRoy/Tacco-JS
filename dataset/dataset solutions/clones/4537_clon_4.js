((sourceText) => {
    const digitSequences = sourceText.split('\n')[0].match(/\d+/g);
    const firstOperand = Number(digitSequences[0]);
    const secondOperand = Number(digitSequences[1]);

    const computedSum = firstOperand + secondOperand;

    console.log(computedSum >= 10 ? 'error' : computedSum);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
