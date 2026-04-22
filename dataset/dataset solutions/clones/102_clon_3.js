const fileSystemHandler = require("fs");

const standardInputFile = "/dev/stdin";

const EXPECTED_SEQUENCE_LENGTH = 4;

function parseSequenceString(inputLine) {
    if (typeof inputLine !== 'string' || inputLine.trim() === '') {
        return [];
    }
    return inputLine.trim().split(/\s+/).filter(element => element.length > 0);
}

function calculateMatchResults(attemptCode, secretCode) {
    let currentHits = 0;
    let currentBlows = 0;

    if (attemptCode.length !== EXPECTED_SEQUENCE_LENGTH || secretCode.length !== EXPECTED_SEQUENCE_LENGTH) {
        return { hits: 0, blows: 0 };
    }

    for (let pos = 0; pos < EXPECTED_SEQUENCE_LENGTH; pos++) {
        if (attemptCode[pos] === secretCode[pos]) {
            currentHits++;
        } else {
            const valueToSearch = attemptCode[pos];
            const occurrences = secretCode.filter(item => item === valueToSearch).length;
            currentBlows += occurrences;
        }
    }

    return { hits: currentHits, blows: currentBlows };
}

const rawFileContent = fileSystemHandler.readFileSync(standardInputFile, "utf8");

const allInputLines = rawFileContent.split('\n').filter(line => line.length > 0);

const numberOfInputRecords = allInputLines.length;

for (let dataPairIndex = 0; dataPairIndex < numberOfInputRecords; dataPairIndex += 2) {
    if (dataPairIndex + 1 >= numberOfInputRecords) {
        break;
    }

    const attemptLineString = allInputLines[dataPairIndex];
    const secretLineString = allInputLines[dataPairIndex + 1];

    const attemptElements = parseSequenceString(attemptLineString);
    const secretElements = parseSequenceString(secretLineString);

    if (attemptElements.length !== EXPECTED_SEQUENCE_LENGTH || secretElements.length !== EXPECTED_SEQUENCE_LENGTH) {
        continue;
    }

    const comparisonResults = calculateMatchResults(attemptElements, secretElements);

    console.log(`${comparisonResults.hits} ${comparisonResults.blows}`);
}