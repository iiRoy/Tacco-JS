(function(rawContent) {
    const calculateSumOfDigits = (numericValue) => {
        if (isNaN(numericValue) || numericValue < 0) {
            return NaN;
        }

        let digitAccumulator = 0;
        let currentNumber = numericValue;

        while (currentNumber > 0) {
            digitAccumulator += currentNumber % 10;
            currentNumber = Math.floor(currentNumber / 10);
        }
        return digitAccumulator;
    };

    const sourceLines = rawContent.split('\n');
    let lineIterator = 0;

    while (lineIterator < sourceLines.length) {
        const processedNumber = Number(sourceLines[lineIterator]);

        if (processedNumber === 0) {
            break;
        }

        console.log(calculateSumOfDigits(processedNumber));
        lineIterator++;
    }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
