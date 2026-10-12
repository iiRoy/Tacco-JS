function executeProcessing(rawInputContent) {
    const cleanedInput = rawInputContent.trim();
    const firstLineOfInput = cleanedInput.split('\n')[0];
    const stringValueArray = firstLineOfInput.split(' ');
    const numericValues = stringValueArray.map(Number);

    let firstOperand = numericValues[0];
    let secondOperand = numericValues[1];
    let cumulativeSum = 0;

    const PROCESSING_ROUNDS = 2;

    function determineAndDecrement(currentA, currentB) {
        if (currentA > currentB) {
            return {
                valueToSum: currentA,
                nextA: currentA - 1,
                nextB: currentB
            };
        } else {
            return {
                valueToSum: currentB,
                nextA: currentA,
                nextB: currentB - 1
            };
        }
    }

    for (let iterationIndex = 0; iterationIndex < PROCESSING_ROUNDS; iterationIndex++) {
        const roundResult = determineAndDecrement(firstOperand, secondOperand);
        cumulativeSum += roundResult.valueToSum;
        firstOperand = roundResult.nextA;
        secondOperand = roundResult.nextB;
    }

    console.log(cumulativeSum);
}

executeProcessing(require('fs').readFileSync('/dev/stdin', 'utf8'));
