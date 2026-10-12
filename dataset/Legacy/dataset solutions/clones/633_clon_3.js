const CLOUD_MARKER = "c";
const EMPTY_SPACE_MARKER = ".";
const NO_CLOUD_FOUND_VALUE = -1;
const INITIAL_CLOUD_DISTANCE = 0;
const NEXT_CLOUD_DISTANCE_START = 1;

function calculateCloudDistances(lineContent) {
    const characters = lineContent.split("");
    const distances = [];
    let currentCloudProximity = NO_CLOUD_FOUND_VALUE;

    for (let charIdx = 0; charIdx < characters.length; charIdx++) {
        const char = characters[charIdx];

        if (char === CLOUD_MARKER) {
            distances.push(INITIAL_CLOUD_DISTANCE);
            currentCloudProximity = NEXT_CLOUD_DISTANCE_START;
        } else if (char === EMPTY_SPACE_MARKER) {
            if (currentCloudProximity === NO_CLOUD_FOUND_VALUE) {
                distances.push(NO_CLOUD_FOUND_VALUE);
            } else {
                distances.push(currentCloudProximity);
                currentCloudProximity++;
            }
        }
    }
    return distances;
}

var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var processedLines = rawData.trim().split("\n");

var gridDimensionsString = processedLines.shift();

var finalResultMatrix = [];

processedLines.forEach(function(singleLineContent) {
    const lineDistances = calculateCloudDistances(singleLineContent);
    finalResultMatrix.push(lineDistances);
});

const formattedOutputLines = finalResultMatrix.map(function(row) {
    return row.join(" ");
});

console.log(formattedOutputLines.join("\n"));
