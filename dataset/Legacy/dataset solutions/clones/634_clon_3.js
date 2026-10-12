function processInputData() {
    const numRows = readNextToken();
    const numCols = readNextToken();

    for (let rowIndex = 0; rowIndex < numRows; ++rowIndex) {
        const currentRowString = readNextToken('string');
        const distanceArray = calculateDistancesForRow(currentRowString, numCols);
        outputResult(distanceArray.join(' '));
    }
}

function calculateDistancesForRow(inputString, columnCount) {
    const distances = [];
    let currentCloudDistance = -1;

    for (let colIdx = 0; colIdx < columnCount; ++colIdx) {
        const charAtCurrentPos = inputString.charAt(colIdx);

        if (charAtCurrentPos === 'c') {
            distances.push(0);
            currentCloudDistance = 1;
        } else {
            if (currentCloudDistance !== -1) {
                distances.push(currentCloudDistance);
                currentCloudDistance++;
            } else {
                distances.push(-1);
            }
        }
    }
    return distances;
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

let bufferedInput = '';
let currentTokenIndex = 0;

function readNextToken(dataTypeHint) {
    const token = bufferedInput[currentTokenIndex++];
    if (dataTypeHint === 'string') {
        return token;
    } else {
        return Number(token);
    }
}

function outputResult(outputValue) {
    console.log(outputValue);
}

process.stdin.on('data', function(dataChunk) {
    bufferedInput += dataChunk;
});

process.stdin.on('end', function() {
    bufferedInput = bufferedInput.split(/\s+/).filter(Boolean);
    processInputData();
});
