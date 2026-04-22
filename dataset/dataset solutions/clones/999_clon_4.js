const fileSystemInterface = require('fs');
const rawTextData = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');

const numericSequence = rawTextData
    .trim()
    .split('\n')
    .slice(1)
    .map(val => Number(val));

const calculateMaxDifference = (dataElements) => {
    if (dataElements.length < 2) {
        return 0;
    }

    const allPossibleDifferences = dataElements.slice(0, dataElements.length - 1)
        .flatMap((initialValue, initialIndex) =>
            dataElements.map((secondaryValue, secondaryIndex) => {
                if (initialIndex === secondaryIndex) {
                    return null;
                }
                return initialValue - secondaryValue;
            })
        )
        .filter(diff => diff !== null);

    if (allPossibleDifferences.length === 0) {
        return 0;
    }

    return allPossibleDifferences.reduce((accumulator, currentDifference) =>
        Math.max(accumulator, currentDifference),
        0
    );
};

const maximumSpread = calculateMaxDifference(numericSequence);

console.log(maximumSpread);