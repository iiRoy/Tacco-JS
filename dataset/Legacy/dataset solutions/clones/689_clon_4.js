const fileSystem = require('fs');

const processInputData = (rawData) => {
    const dataLines = rawData.trim().split('\n');

    function* resultGenerator() {
        for (const lineContent of dataLines) {
            const currentNumericValue = parseInt(lineContent, 10);

            if (currentNumericValue === 0) {
                break;
            }

            const currentCube = Math.pow(currentNumericValue, 3);

            const potentialXValues = Array.from({ length: currentNumericValue - 1 }, (_, iIndex) => currentNumericValue - 1 - iIndex)
                .flatMap(firstTerm =>
                    Array.from({ length: firstTerm }, (_, jIndex) => firstTerm - jIndex)
                        .map(secondTerm => currentCube - Math.pow(firstTerm, 3) - Math.pow(secondTerm, 3))
                        .filter(computedX => computedX > 0)
                );

            if (potentialXValues.length > 0) {
                yield Math.min(...potentialXValues);
            } else {
                yield undefined;
            }
        }
    }

    for (const finalResult of resultGenerator()) {
        console.log(finalResult);
    }
};

processInputData(fileSystem.readFileSync('/dev/stdin', 'utf8'));
