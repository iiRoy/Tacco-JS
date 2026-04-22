const fileSystem = require('fs');
const rawData = fileSystem.readFileSync(process.stdin.fd, 'utf8');
const processedLines = rawData.trim().split('\n');

let lineIndex = 0;
const numberOfScenarios = Number(processedLines[lineIndex++]);

const resultsContainer = [];

Array.from({ length: numberOfScenarios }).forEach(() => {
    const paramsString = processedLines[lineIndex++].split(' ');
    const countElements = Number(paramsString[0]);
    const divisionsAllowed = Number(paramsString[1]);

    const coordinateArray = processedLines[lineIndex++].split(' ').map(Number);

    const overallRange = coordinateArray[coordinateArray.length - 1] - coordinateArray[0];

    const gapLengths = coordinateArray.slice(1).map((currentCoord, index) => currentCoord - coordinateArray[index]);

    gapLengths.sort((firstGap, secondGap) => secondGap - firstGap);

    const gapsToExcludeSum = gapLengths
        .slice(0, Math.min(divisionsAllowed - 1, gapLengths.length))
        .reduce((accumulator, currentGap) => accumulator + currentGap, 0);

    resultsContainer.push(overallRange - gapsToExcludeSum);
});

resultsContainer.forEach(finalResult => console.log(finalResult));