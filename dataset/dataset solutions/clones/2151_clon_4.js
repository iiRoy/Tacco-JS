const evaluateNumericalCriteria = (rawData) => {
    const allLines = rawData.split('\n');
    const relevantLine = allLines[1];
    const numericStrings = relevantLine.split(' ');

    const finalDecision = numericStrings.reduce((currentStatus, valueString) => {
        if (currentStatus === 'REJECTED') {
            return 'REJECTED';
        }

        const valueAsNumber = Number(valueString);

        const isEven = (valueAsNumber % 2 === 0);
        const isNotDivisibleByThree = (valueAsNumber % 3 !== 0);
        const isNotDivisibleByFive = (valueAsNumber % 5 !== 0);

        if (isEven && isNotDivisibleByThree && isNotDivisibleByFive) {
            return 'REJECTED';
        }

        return 'ACCEPTED';
    }, 'ACCEPTED');

    console.log(finalDecision);
};

evaluateNumericalCriteria(require('node:fs').readFileSync('/dev/stdin', 'utf8'));