const rawDataString = require('fs').readFileSync('/dev/stdin', 'utf8');

const determineSmallestPositiveDifference = (upperBound) => {
    if (upperBound <= 0) {
        return Infinity; // Consistent with Math.min on empty set for z=1 case
    }

    const initialCubeValue = Math.pow(upperBound, 3);

    const potentialDifferences = Array.from({ length: upperBound - 1 }, (_, outerIndex) => outerIndex + 1)
        .flatMap(firstTerm => {
            const firstTermCube = Math.pow(firstTerm, 3);
            return Array.from({ length: firstTerm }, (_, innerIndex) => innerIndex + 1)
                .map(secondTerm => {
                    const secondTermCube = Math.pow(secondTerm, 3);
                    return initialCubeValue - firstTermCube - secondTermCube;
                });
        });

    const validResults = potentialDifferences.filter(outcome => outcome > 0);

    return Math.min(...validResults);
};

const processedValues = rawDataString.trim().split('\n');

for (const currentInputLine of processedValues) {
    const numericValue = Number(currentInputLine.trim());

    if (numericValue === 0) {
        break;
    }

    const computedOutcome = determineSmallestPositiveDifference(numericValue);
    console.log(computedOutcome);
}