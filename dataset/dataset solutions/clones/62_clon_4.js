(function(inputData) {
    function calculateLargeSum(operandA, operandB) {
        const maxLen = Math.max(operandA.length, operandB.length);

        const paddedA = operandA.padStart(maxLen, '0');
        const paddedB = operandB.padStart(maxLen, '0');

        const digitsA = paddedA.split('').map(Number);
        const digitsB = paddedB.split('').map(Number);

        function recurseAdd(digitIndex, currentCarry) {
            if (digitIndex < 0) {
                return currentCarry > 0 ? [currentCarry] : [];
            }

            const valA = digitsA[digitIndex];
            const valB = digitsB[digitIndex];

            const totalAtPosition = valA + valB + currentCarry;
            const resultDigit = totalAtPosition % 10;
            const nextCarry = Math.floor(totalAtPosition / 10);

            const precedingDigits = recurseAdd(digitIndex - 1, nextCarry);

            return [...precedingDigits, resultDigit];
        }

        const finalDigitsArray = recurseAdd(maxLen - 1, 0);

        return finalDigitsArray.join('');
    }

    const inputLines = inputData.replace(/\n$/, '').split('\n');

    const numberOfPairs = Number(inputLines.shift());

    for (let pairCounter = 0; pairCounter < numberOfPairs; pairCounter++) {
        const firstNumStr = inputLines.shift();
        const secondNumStr = inputLines.shift();

        const calculatedResult = calculateLargeSum(firstNumStr, secondNumStr);

        if (calculatedResult.length >= 80) {
            console.log('overflow');
        } else {
            console.log(calculatedResult);
        }
    }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
