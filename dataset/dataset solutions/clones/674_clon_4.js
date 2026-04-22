const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const linesOfData = rawInputContent.split('\n');

function processDataUnits(unitsCollection, currentPosition = 0) {
    if (currentPosition >= unitsCollection.length) {
        return;
    }

    const currentUnit = unitsCollection[currentPosition];

    const numericalSegments = currentUnit.split(' ').map(segment => parseInt(segment));

    const combinedFigures = [
        numericalSegments[0] + numericalSegments[3],
        numericalSegments[1] + numericalSegments[4],
        numericalSegments[2] + numericalSegments[5]
    ];

    const cumulativeTotal = combinedFigures.reduce((accumulator, value) => accumulator + value, 0);
    if (cumulativeTotal === 0) {
        process.exit(0);
    }

    function deriveScore(figureComponents) {
        let finalScoreValue = 0;
        const remainderComponents = [];

        for (let idx = 0; idx < figureComponents.length; idx++) {
            finalScoreValue += Math.floor(figureComponents[idx] / 3);
            remainderComponents.push(figureComponents[idx] % 3);
        }

        const smallestAvailable = Math.min(...remainderComponents);
        if (smallestAvailable > 0) {
            finalScoreValue += smallestAvailable;
        }
        
        return finalScoreValue;
    }

    const calculatedOutcome = deriveScore(combinedFigures);
    console.log(calculatedOutcome);

    processDataUnits(unitsCollection, currentPosition + 1);
}

processDataUnits(linesOfData);