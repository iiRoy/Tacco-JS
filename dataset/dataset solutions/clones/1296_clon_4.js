const sourceMaterial = require('fs').readFileSync('/dev/stdin', 'utf8');
const contentLines = sourceMaterial.trim().split('\n');

const calculateViableTriplets = (upperBoundValue, targetSumValue) => {
    return Array.from({ length: upperBoundValue }, (_, firstIndex) => firstIndex + 1)
        .flatMap(firstElement => {
            return Array.from({ length: upperBoundValue - firstElement }, (_, secondIndex) => firstElement + 1 + secondIndex)
                .map(secondElement => {
                    const thirdElement = targetSumValue - firstElement - secondElement;
                    return (thirdElement > secondElement && thirdElement <= upperBoundValue)
                        ? [firstElement, secondElement, thirdElement]
                        : null;
                })
                .filter(Boolean);
        }).length;
};

const finalResultsArray = [];
for (const lineContent of contentLines) {
    const parsedNumbers = lineContent.split(' ').map(Number);
    const currentUpper = parsedNumbers[0];
    const currentTarget = parsedNumbers[1];

    if (currentUpper === 0 && currentTarget === 0) {
        break;
    }

    finalResultsArray.push(calculateViableTriplets(currentUpper, currentTarget));
}

finalResultsArray.forEach(resultEntry => console.log(resultEntry));