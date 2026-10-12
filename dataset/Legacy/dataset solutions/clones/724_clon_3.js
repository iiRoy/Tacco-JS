const fileSystem = require('fs');
const standardInputPath = '/dev/stdin';
const terminationSignal = ".";
const nonStructuralCharsRegex = /[a-zA-Z]|\.|\s/g;
const balancedPairRegex = /\[\]|\(\)/g;

function evaluateStringBalance(inputSegment) {
    let processingSegment = inputSegment;

    // First, remove all characters that are not part of the balancing structure
    processingSegment = processingSegment.replace(nonStructuralCharsRegex, "");

    // Repeatedly remove immediately balanced pairs until no more can be found
    let wasModifiedInPass = true;
    while (wasModifiedInPass) {
        const segmentLengthBeforePass = processingSegment.length;
        processingSegment = processingSegment.replace(balancedPairRegex, "");
        wasModifiedInPass = processingSegment.length < segmentLengthBeforePass; // If length changed, modifications occurred
    }

    // If the segment is empty after all removals, it was balanced
    return processingSegment === "";
}

const rawInputContent = fileSystem.readFileSync(standardInputPath, 'utf8');
const inputLineArray = rawInputContent.trim().split("\n");

for (let currentLineIndex = 0; currentLineIndex < inputLineArray.length; currentLineIndex++) {
    const activeLine = inputLineArray[currentLineIndex];

    // Terminate processing if the special marker is encountered
    if (activeLine === terminationSignal) {
        break;
    }

    // Determine if the current line's structural elements are balanced
    const isBalancedResult = evaluateStringBalance(activeLine);

    // Output the result based on the balance check
    console.log(isBalancedResult ? "yes" : "no");
}
