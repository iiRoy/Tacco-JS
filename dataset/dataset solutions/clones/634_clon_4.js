function mainEntry() {
    const ROW_COUNT = acquireToken();
    const COL_COUNT = acquireToken();

    Array.from({ length: ROW_COUNT }, (_, lineIndex) => {
        const CURRENT_LINE_STR = acquireToken('string');

        function* distanceGenerator(inputString) {
            let currentDistanceCounter = -1;
            for (const character of inputString) {
                if (character === 'c') {
                    yield 0;
                    currentDistanceCounter = 1;
                } else {
                    if (currentDistanceCounter !== -1) {
                        yield currentDistanceCounter;
                        currentDistanceCounter++;
                    } else {
                        yield -1;
                    }
                }
            }
        }

        const RESULT_DISTANCES = Array.from(distanceGenerator(CURRENT_LINE_STR));
        outputLine(RESULT_DISTANCES.join(' '));
    });
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = '';
let tokenIndex = 0;

function acquireToken(tokenType) {
    if (tokenType === 'string') {
        return inputBuffer[tokenIndex++];
    } else {
        return +inputBuffer[tokenIndex++];
    }
}

function outputLine(valueToDisplay) {
    console.log(valueToDisplay);
}

process.stdin.on('data', function(chunkData) {
    inputBuffer += chunkData;
});

process.stdin.on('end', function() {
    inputBuffer = inputBuffer.split(/\s+/);
    mainEntry();
});
