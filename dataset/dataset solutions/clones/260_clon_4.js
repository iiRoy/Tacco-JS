let configParams = {};

let gridMatrix = [];

function* tracePathForward(startColumn, startRowIndex = 0) {
    let currentColumn = startColumn;
    for (let rowIndex = startRowIndex; rowIndex < gridMatrix.length; rowIndex++) {
        yield currentColumn;
        currentColumn += gridMatrix[rowIndex][currentColumn];
    }
    yield currentColumn;
}

function* tracePathReverse(endColumn) {
    let currentColumn = endColumn;
    const pathSegments = [];
    pathSegments.push(currentColumn);
    for (let rowIndex = gridMatrix.length - 1; rowIndex >= 0; rowIndex--) {
        currentColumn += gridMatrix[rowIndex][currentColumn];
        pathSegments.push(currentColumn);
    }

    for (let i = pathSegments.length - 1; i >= 0; i--) {
        yield pathSegments[i];
    }
}

const inputLines = [];
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (chunk) {
    chunk.trim().split('\n').forEach(function (line) {
        inputLines.push(line);
    });
});

process.stdin.on('end', function () {
    let outputResult = "";
    let parameterIndex = 0;
    const parameterKeys = ['columnCount', 'initialColumn', 'finalColumn', 'maxSteps'];

    for (const currentLine of inputLines) {
        if (currentLine === "0") {
            return;
        }

        if (parameterIndex < parameterKeys.length) {
            configParams[parameterKeys[parameterIndex]] = parseInt(currentLine, 10);
            parameterIndex++;
        } else {
            const currentRowChars = Array.from(currentLine);
            const processedRow = currentRowChars.map(Number);

            for (let k = 1; k < processedRow.length; k++) {
                if (processedRow[k] === 0 && processedRow[k - 1] === 1) {
                    processedRow[k] = -1;
                }
            }
            processedRow.push((processedRow[processedRow.length - 1] === 1) ? -1 : 0);
            gridMatrix.push(processedRow);
        }
    }

    configParams.initialColumn -= 1;
    configParams.finalColumn -= 1;

    const forwardPath = Array.from(tracePathForward(configParams.initialColumn));

    if (forwardPath[forwardPath.length - 1] === configParams.finalColumn) {
        console.log("0");
        return;
    }

    const backwardPathReversed = Array.from(tracePathReverse(configParams.finalColumn));

    const connectionFound = Array.from({ length: configParams.maxSteps }).some((_, stepIdx) => {
        const currentForwardPosition = forwardPath[stepIdx];
        const currentBackwardPosition = backwardPathReversed[stepIdx];

        if (
            Math.abs(currentForwardPosition - currentBackwardPosition) === 1 &&
            gridMatrix[stepIdx][currentForwardPosition] === 0 &&
            gridMatrix[stepIdx][currentBackwardPosition] === 0
        ) {
            outputResult = `${stepIdx + 1} ${((currentForwardPosition < currentBackwardPosition) ? currentForwardPosition : currentBackwardPosition) + 1}`;
            return true;
        }
        return false;
    });

    if (!connectionFound) {
        outputResult = "1";
    }

    console.log(outputResult);
});
