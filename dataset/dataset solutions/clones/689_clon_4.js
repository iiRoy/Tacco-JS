const fileSystemHandler = require('fs');

const sourceData = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');

const lineSegments = sourceData.trim().split('\n');

let segmentIndex = 0;

const fetchNextNumericEntry = () => {
    while (segmentIndex < lineSegments.length) {
        const currentSegment = lineSegments[segmentIndex++].trim();
        if (currentSegment === '') {
            continue;
        }
        const parsedValue = Number(currentSegment);
        if (!isNaN(parsedValue)) {
            return parsedValue;
        }
    }
    return 0;
};

let currentBase;
while ((currentBase = fetchNextNumericEntry()) !== 0) {
    let smallestPositiveResult = Infinity;
    const baseValueCube = Math.pow(currentBase, 3);

    for (let firstFactor = 1; firstFactor < currentBase; ++firstFactor) {
        const firstFactorCube = Math.pow(firstFactor, 3);
        for (let secondFactor = 1; secondFactor <= firstFactor; ++secondFactor) {
            const secondFactorCube = Math.pow(secondFactor, 3);
            const resultingDifference = baseValueCube - firstFactorCube - secondFactorCube;

            if (resultingDifference > 0 && resultingDifference < smallestPositiveResult) {
                smallestPositiveResult = resultingDifference;
            }
        }
    }
    console.log(smallestPositiveResult);
}