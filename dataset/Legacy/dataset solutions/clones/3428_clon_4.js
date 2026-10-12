const fileSystem = require('fs');

function determineSmallestDifference(sourceText) {
    const processedText = sourceText.trim();
    let currentMinimum = Number.MAX_SAFE_INTEGER;

    for (let positionIndex = 0; positionIndex <= processedText.length - 3; positionIndex++) {
        const threeCharSegment = processedText.substring(positionIndex, positionIndex + 3);
        const numericalValue = parseInt(threeCharSegment, 10);

        if (isNaN(numericalValue)) {
            return currentMinimum;
        }

        const absoluteDifference = Math.abs(numericalValue - 753);
        currentMinimum = Math.min(currentMinimum, absoluteDifference);
    }

    return currentMinimum;
}

function runApplication() {
    const inputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
    const computedResult = determineSmallestDifference(inputData);
    console.log(computedResult.toString());
}

runApplication();
