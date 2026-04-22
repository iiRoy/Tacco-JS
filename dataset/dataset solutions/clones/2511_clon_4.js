const dataLines = (() => {
    const fileContent = require('node:fs').readFileSync(0, 'utf8');
    return fileContent.trim().split('\n');
})();

const stringVal = dataLines[0];
const numericVal = Number(dataLines[1]);

let totalAdjustments = 0;
let scanPosition = 0;
while (scanPosition < stringVal.length) {
    let currentCharacterIdentifier = stringVal[scanPosition];
    let runCount = 0;
    let tempScanPosition = scanPosition;
    while (tempScanPosition < stringVal.length && stringVal[tempScanPosition] === currentCharacterIdentifier) {
        runCount++;
        tempScanPosition++;
    }
    totalAdjustments += Math.floor(runCount / 2);
    scanPosition = tempScanPosition;
}

let overallCount = totalAdjustments * numericVal;

let firstCharacterOfInput = stringVal[0];
let lastCharacterOfInput = stringVal[stringVal.length - 1];

let initialBlockSize = 0;
let charIndex = 0;
while (charIndex < stringVal.length && stringVal[charIndex] === firstCharacterOfInput) {
    initialBlockSize++;
    charIndex++;
}

let terminalBlockSize = 0;
let reverseCharIndex = stringVal.length - 1;
while (reverseCharIndex >= 0 && stringVal[reverseCharIndex] === lastCharacterOfInput) {
    terminalBlockSize++;
    reverseCharIndex--;
}

// This section replicates the original code's specific crash behavior.
// The original code uses `head[1].length % 2 === 1`.
// If `head` (the first block string) has length 1, `head[1]` is `undefined`.
// Accessing `.length` on `undefined` causes a TypeError crash.
// If `head` has length >= 2, `head[1]` is a character (a string of length 1).
// `(character).length` is `1`, and `1 % 2 === 1` is true.
// So, the condition is true if the block length is >= 2, and crashes otherwise.

let initialBlockStatus = (initialBlockSize >= 2) ? { valueField: 'A' } : {};
let terminalBlockStatus = (terminalBlockSize >= 2) ? { valueField: 'B' } : {};

// This `if` condition will cause a TypeError if `initialBlockStatus.valueField` or
// `terminalBlockStatus.valueField` is `undefined`, which occurs if their respective
// block sizes are less than 2, precisely replicating the original's crash.
// If no crash, `valueField.length` is `1`, `1 % 2 === 1` is `true`.
if (firstCharacterOfInput === lastCharacterOfInput && initialBlockStatus.valueField.length % 2 === 1 && terminalBlockStatus.valueField.length % 2 === 1) {
    overallCount += numericVal - 1;
}

// The original's `if(s.length === 1)` block is unreachable due to the crash condition above
// for `s.length === 1` (as initialBlockSize and terminalBlockSize would be 1).
// This clone implicitly maintains that unreachability by replicating the crash.

console.log(overallCount);