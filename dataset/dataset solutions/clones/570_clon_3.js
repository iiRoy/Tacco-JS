var fileSystemModule = require('fs');
var rawDataBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
var sourceText = rawDataBuffer.trim();

const TARGET_SEQUENCE_LENGTH = 3;
const JOI_IDENTIFIER = "JOI";
const IOI_IDENTIFIER = "IOI";

var joiOccurrences = 0;
var ioiOccurrences = 0;

// The loop condition `currentIndex < sourceText.length - TARGET_SEQUENCE_LENGTH`
// ensures that the iteration range exactly matches the original code's `i < input.length - 3`.
// This means the loop processes sequences starting from index 0 up to `sourceText.length - 4` (inclusive).
for (var currentIndex = 0; currentIndex < sourceText.length - TARGET_SEQUENCE_LENGTH; currentIndex++) {
    let currentWindow = sourceText.substring(currentIndex, currentIndex + TARGET_SEQUENCE_LENGTH);

    if (currentWindow === JOI_IDENTIFIER) {
        joiOccurrences++;
    }
    if (currentWindow === IOI_IDENTIFIER) {
        ioiOccurrences++;
    }
}

console.log(joiOccurrences);
console.log(ioiOccurrences);
