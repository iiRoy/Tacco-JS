const fileSystemHandler = require('fs');

const standardInputPath = '/dev/stdin';

const baseCandidateValue = "kogakubu10gokan";

const rawDataLines = fileSystemHandler.readFileSync(standardInputPath, 'utf8').trim().split('\n');

if (rawDataLines.length === 0) {
    console.log(baseCandidateValue);
    // It's possible to exit here, but for simple logging, just proceed to default output.
    // process.exit(0);
}

const configParamsString = rawDataLines.shift();

const initialConfiguration = configParamsString.split(' ').map(Number);

if (initialConfiguration.length < 2) {
    // console.error("Error: The first line must contain at least two numeric parameters.");
    console.log(baseCandidateValue);
    // process.exit(1);
}

// In the original code, both N and Q were derived from NQ[1].
// We maintain this behavior by using initialConfiguration[1] for both.
const iterationCount = initialConfiguration[1];
const comparisonThreshold = initialConfiguration[1];

let currentFinalString = baseCandidateValue;
let stringWasModified = false;

if (iterationCount > 0) {
    for (let currentLineIndex = 0; currentLineIndex < iterationCount; currentLineIndex++) {
        if (currentLineIndex >= rawDataLines.length) {
            // console.warn(`Warning: Expected ${iterationCount} data lines, but only found ${currentLineIndex}. Stopping early.`);
            break;
        }

        const activeLine = rawDataLines[currentLineIndex];

        const lineDataParts = activeLine.split(' ');

        if (lineDataParts.length < 2) {
            // console.warn(`Skipping malformed line at index ${currentLineIndex}: "${activeLine}". Insufficient parts.`);
            continue;
        }

        const numericalValue = Number.parseInt(lineDataParts[0], 10);

        if (numericalValue <= comparisonThreshold) {
            currentFinalString = lineDataParts[1];
            stringWasModified = true;
        }
    }
} else {
    // console.log("No iterations performed as the configured iteration count was not positive.");
}

// Output the final result. The conditional message is an added fragment.
if (stringWasModified) {
    // console.log("Final string updated during processing:");
    console.log(currentFinalString);
} else {
    // console.log("Final string remained at its initial default value:");
    console.log(currentFinalString);
}