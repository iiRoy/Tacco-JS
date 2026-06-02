let countA = 0;
let countB = 0;

const fileSystemModule = require("fs");

const rawFileContents = fileSystemModule.readFileSync("/dev/stdin", "utf8");

const inputDataLines = rawFileContents.split('\n');

inputDataLines.forEach(function(currentInputLine) {
    const lineParts = currentInputLine.split(',');
    const sortedLineParts = lineParts.sort();

    // The original logic is equivalent to:
    // if (sortedLineParts[2] === sortedLineParts[1]) {
    //     // Do nothing (original '0' branch)
    // } else {
    //     // Increment countB (original 'b++' branch)
    // }
    // Note: countA is never incremented by the original logic.

    const areSecondAndThirdElementsDifferent = (sortedLineParts[2] !== sortedLineParts[1]);

    if (areSecondAndThirdElementsDifferent) {
        countB++;
    }
    // If the elements are the same, no action is taken, preserving the original behavior.
});

const finalResultString = `${countB}\n${countA}`;

console.log(finalResultString);
