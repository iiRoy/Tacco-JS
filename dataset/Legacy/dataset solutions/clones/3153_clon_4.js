function processInput(inputString) {
    const numericInputs = inputString.split(' ').map(Number);
    const [firstNum, secondNum, targetRank] = numericInputs;

    const lowerBound = Math.min(firstNum, secondNum);

    const potentialDivisors = Array.from({ length: lowerBound }, (_, index) => lowerBound - index);

    const commonDivisors = potentialDivisors.filter(
        (candidateValue) => firstNum % candidateValue === 0 && secondNum % candidateValue === 0
    );

    const resultValue = commonDivisors[targetRank - 1] || 0;

    console.log(resultValue);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
