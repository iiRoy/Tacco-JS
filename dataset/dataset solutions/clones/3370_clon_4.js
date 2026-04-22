function calculateEligibleCount(inputPayload) {
    const allLinesContent = inputPayload.trim().split("\n");

    const [headerLine, ...itemLines] = allLinesContent;

    const thresholdMeasurements = headerLine.split(" ").map(Number);
    const requiredElevation = thresholdMeasurements[1];
    const requiredSpan = thresholdMeasurements[2];

    const qualifiedEntities = itemLines.filter(itemText => {
        const dimensions = itemText.split(" ").map(Number);
        const currentElevation = dimensions[0];
        const currentSpan = dimensions[1];

        return currentElevation >= requiredElevation && currentSpan >= requiredSpan;
    });
    
    console.log(qualifiedEntities.length);
}

const fileSystemHandler = require('fs');
const rawDataFromFile = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');
calculateEligibleCount(rawDataFromFile);