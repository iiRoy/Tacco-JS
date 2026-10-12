process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputBuffer) {
    const inputLines = inputBuffer.toString().split('\n');

    function NumericSequenceGenerator(startPoint, endPoint) {
        if (startPoint > endPoint) {
            return [];
        }
        return Array.from({ length: endPoint - startPoint + 1 }, (_, index) => startPoint + index);
    }

    const isSpecialNumber = (currentNumber) => {
        const isDivisibleByThree = currentNumber % 3 === 0;
        const endsWithThree = currentNumber % 10 === 3;
        const isExactlyThirty = currentNumber === 30;
        const hasTensDigitThreeAndIsMultipleOfTen = (currentNumber % 10 === 0) && ((currentNumber / 10) % 10 === 3);

        const meetsAnyCondition = isDivisibleByThree || endsWithThree || isExactlyThirty || hasTensDigitThreeAndIsMultipleOfTen;
        return meetsAnyCondition;
    };

    const upperBound = parseInt(inputLines[0], 10);

    const finalOutputString = (function(limitValue) {
        const sequence = NumericSequenceGenerator(1, limitValue);
        const filteredNumbers = sequence.filter(isSpecialNumber);
        return filteredNumbers.join(' ');
    }(upperBound));

    if (finalOutputString) {
        console.log('', finalOutputString);
    } else {
        console.log();
    }
});
