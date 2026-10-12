const fileSystemModule = require('fs');

const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const processedInputLines = rawInputContent.replace(/\n$/, '').split('\n');

const testCaseCount = Number(processedInputLines[0]);

const extractCircleParameters = (lineText) => {
    return lineText.split(' ').map(Number);
};

const determineCircleRelationship = (circleData) => {
    const [xCoord1, yCoord1, radius1, xCoord2, yCoord2, radius2] = circleData;

    const distanceBetweenCenters = Math.hypot(xCoord2 - xCoord1, yCoord2 - yCoord1);

    if (distanceBetweenCenters > radius1 + radius2) {
        return 0;
    }

    if (distanceBetweenCenters < radius2 - radius1) {
        return -2;
    }

    if (distanceBetweenCenters < radius1 - radius2) {
        return 2;
    }

    return 1;
};

processedInputLines.slice(1, testCaseCount + 1).forEach(line => {
    const currentCircleSet = extractCircleParameters(line);
    const relationshipResult = determineCircleRelationship(currentCircleSet);
    console.log(relationshipResult);
});
