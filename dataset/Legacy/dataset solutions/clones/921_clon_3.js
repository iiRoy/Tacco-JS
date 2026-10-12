const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';

function resolveTwoCharPair(currentPairSegment) {
    if (currentPairSegment === "TT") {
        return "T";
    }
    // This condition handles "TF" and returns "F".
    // The original code had a subsequent, unreachable 'if (s=="TF") return "T";'
    // which is correctly omitted here to reflect the actual execution path.
    if (currentPairSegment === "TF") {
        return "F";
    }
    if (currentPairSegment === "FT") {
        return "T";
    }
    // For any other two-character sequence (e.g., "FF"),
    // this function will implicitly return 'undefined'.
    // The String.prototype.replace method then converts 'undefined' to the string "undefined",
    // preserving the exact behavior of the original code.
}

const rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');

const processedInputContent = rawInputContent.trim();
const inputLineSegments = processedInputContent.split("\n");

const initialNumericValue = inputLineSegments.shift(); // Corresponds to 'n' in original, remains unused.
let processingStringValue = inputLineSegments.shift(); // Corresponds to 'str' in original.

const twoCharacterRegex = /../;

while (processingStringValue.length !== 1) {
    processingStringValue = processingStringValue.replace(twoCharacterRegex, resolveTwoCharPair);
}

console.log(processingStringValue);
