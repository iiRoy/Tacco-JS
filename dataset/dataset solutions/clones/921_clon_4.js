var linesOfInput = require('fs').readFileSync('/dev/stdin', 'utf8');
var parsedLines = linesOfInput.trim().split("\n");
var initialConfig = parsedLines.shift();
var sequenceToReduce = parsedLines.shift();

function determineReduction(segment) {
    const transformationRules = new Map([
        ["TT", "T"],
        ["TF", "F"],
        ["FT", "T"]
    ]);
    const outcome = transformationRules.get(segment);
    // The original String.prototype.replace method converts an undefined return
    // from the replacer function into the string "undefined".
    // This behavior must be strictly replicated for any unhandled segments (e.g., "FF").
    return outcome !== undefined ? outcome : "undefined";
}

let processingStack = [];
let currentReadIndex = 0;

while (currentReadIndex < sequenceToReduce.length || processingStack.length > 1) {
    if (processingStack.length >= 2) {
        // If there are at least two elements on the stack, attempt to reduce them.
        const rightOperand = processingStack.pop();
        const leftOperand = processingStack.pop();
        const combinedSegment = leftOperand + rightOperand;
        const reducedValue = determineReduction(combinedSegment);
        processingStack.push(reducedValue);
    } else if (currentReadIndex < sequenceToReduce.length) {
        // If the stack has fewer than two elements, push the next character from the input sequence.
        processingStack.push(sequenceToReduce[currentReadIndex]);
        currentReadIndex++;
    } else {
        // This condition is met when the input sequence is fully processed
        // and the stack has been reduced to a single element.
        break;
    }
}

console.log(processingStack[0]);
