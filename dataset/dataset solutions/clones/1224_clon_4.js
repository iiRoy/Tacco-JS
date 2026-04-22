const fileSystem = require('fs');
const standardInputPath = '/dev/stdin';

const inputBufferAllocation = Buffer.alloc(1024);
let bytesAcquired = 0;
const inputDescriptor = fileSystem.openSync(standardInputPath, 'r');

try {
    bytesAcquired = fileSystem.readSync(inputDescriptor, inputBufferAllocation, 0, inputBufferAllocation.length, 0);
} finally {
    fileSystem.closeSync(inputDescriptor);
}

let fullInputContent = inputBufferAllocation.toString('utf8', 0, bytesAcquired);

const lineBreakPosition = fullInputContent.indexOf('\n');
const primaryContentLine = (lineBreakPosition !== -1) ? fullInputContent.substring(0, lineBreakPosition) : fullInputContent;

function processValueSequence(textSource) {
    const gatheredNumbers = [];
    let currentSegment = '';
    const sourceLength = textSource.length;
    let currentlyInNumber = false;

    for (let index = 0; index < sourceLength; index++) {
        let charFromSource = textSource[index];
        if (charFromSource === ' ') {
            if (currentlyInNumber || currentSegment.length > 0) {
                gatheredNumbers.push(Number(currentSegment));
            } else {
                gatheredNumbers.push(0);
            }
            currentSegment = '';
            currentlyInNumber = false;
        } else {
            currentSegment += charFromSource;
            currentlyInNumber = true;
        }
    }

    if (currentlyInNumber || currentSegment.length > 0) {
        gatheredNumbers.push(Number(currentSegment));
    } else {
        if (sourceLength > 0 && textSource[sourceLength - 1] === ' ') {
            gatheredNumbers.push(0);
        }
    }
    return gatheredNumbers;
}

const finalNumberList = processValueSequence(primaryContentLine);

console.log(finalNumberList);