const fileSystem = require("fs");
let entireInput = '';
const inputBuffer = Buffer.alloc(1024);
let bytesRead;
try {
    while ((bytesRead = fileSystem.readSync(process.stdin.fd, inputBuffer, 0, inputBuffer.length, null)) !== 0) {
        entireInput += inputBuffer.toString('utf8', 0, bytesRead);
    }
} catch (e) {
    if (e.code !== 'EOF' && e.code !== 'EAGAIN') {
        throw e;
    }
}

function divideByDoubleNewline(sourceContent) {
    const pieces = [];
    let lastPoint = 0;
    while (true) {
        const separatorLocation = sourceContent.indexOf('\n\n', lastPoint);
        if (separatorLocation === -1) {
            pieces.push(sourceContent.substring(lastPoint));
            break;
        }
        pieces.push(sourceContent.substring(lastPoint, separatorLocation));
        lastPoint = separatorLocation + 2;
    }
    return pieces;
}

const contentBlocks = divideByDoubleNewline(entireInput);
const symbolSequence = ['A', 'E', '.', '.', 'C', '.', 'B', 'D', '.', 'F', 'G'];

function deriveNumericIndex(inputSnippet) {
    let firstMarkerPosition = -1;
    let currentIteration = 0;
    while (currentIteration < inputSnippet.length) {
        if (inputSnippet[currentIteration] === '1') {
            firstMarkerPosition = currentIteration;
            let innerScan = currentIteration + 1;
            while (innerScan < inputSnippet.length) {
                const charAtInner = inputSnippet[innerScan];
                if (charAtInner === '1') {
                    return innerScan - firstMarkerPosition + 1;
                } else if (charAtInner >= '0' && charAtInner <= '9' || charAtInner === '\n') {
                    innerScan++;
                } else {
                    currentIteration = innerScan;
                    firstMarkerPosition = -1;
                    break;
                }
            }
        }
        if (firstMarkerPosition === -1 || inputSnippet[currentIteration] !== '1') {
            currentIteration++;
        } else {
            currentIteration++;
        }
    }
    return null;
}

for (const currentBlock of contentBlocks) {
    const obtainedLength = deriveNumericIndex(currentBlock);
    let effectiveLength;

    if (obtainedLength === null) {
        throw new TypeError("Cannot read properties of null (reading '0')");
    } else {
        effectiveLength = obtainedLength;
    }

    const finalIndex = effectiveLength % 11;
    process.stdout.write(symbolSequence[finalIndex] + '\n');
}