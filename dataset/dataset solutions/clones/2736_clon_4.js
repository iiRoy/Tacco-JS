const processInput = (inputPayload) => {
    const rawLines = inputPayload.split('\n');

    const quantityIndicator = parseInt(rawLines[0], 10);

    const numericCollection = Array.from({ length: quantityIndicator }, (_, index) =>
        parseInt(rawLines[index + 1], 10)
    );

    const outcomes = numericCollection.map((currentElement, currentPosition, entireCollection) => {
        const subsetWithoutCurrent = entireCollection.filter((_, elementIndex) =>
            elementIndex !== currentPosition
        );

        if (subsetWithoutCurrent.length === 0) {
            return -Infinity;
        }

        const greatestExcludingCurrent = subsetWithoutCurrent.reduce((accumulator, value) => {
            return value > accumulator ? value : accumulator;
        }, -Infinity);

        return greatestExcludingCurrent;
    });

    outcomes.forEach(resultValue => console.log(resultValue));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));