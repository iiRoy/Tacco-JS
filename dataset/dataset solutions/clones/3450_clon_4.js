function extractParameters(rawContent) {
    const contentLines = rawContent.split('\n');

    const secondLineNumbers = contentLines[1].match(/\d+/g).map(Number);
    const initialReading = secondLineNumbers[0];
    const desiredReading = secondLineNumbers[1];

    const thirdLineNumbers = contentLines[2].match(/\d+/g).map(Number);

    return {
        primaryValue: initialReading,
        secondaryValue: desiredReading,
        numericSeries: thirdLineNumbers
    };
}

function locateBestMatch(processedInformation) {
    const rateFactor = 0.006;

    const evaluationOutcome = processedInformation.numericSeries.reduce((currentOptimal, currentElement, currentIndex) => {
        const derivedMetric = processedInformation.primaryValue - (currentElement * rateFactor);
        const absoluteDifference = Math.abs(processedInformation.secondaryValue - derivedMetric);

        if (absoluteDifference <= currentOptimal.deviationMagnitude) {
            return {
                deviationMagnitude: absoluteDifference,
                positionIdentifier: currentIndex
            };
        } else {
            return currentOptimal;
        }
    }, { deviationMagnitude: Number.MAX_VALUE, positionIdentifier: -1 });

    return evaluationOutcome.positionIdentifier + 1;
}

function processEnvironmentalData(dataStream) {
    const structuredData = extractParameters(dataStream);
    const finalSelection = locateBestMatch(structuredData);
    console.log(finalSelection.toString());
}

processEnvironmentalData(require('fs').readFileSync('/dev/stdin', 'utf8'));