process.stdin.resume();
process.stdin.setEncoding('utf8');
const sourceContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const numericSequence = sourceContent.trim().split(/\s+/).map(Number);
const generatedOutputComponents = [];
let iterationMarker = 0;
const evaluateLeapPossibility = (specificYear) => {
    return (specificYear % 400 === 0) || (specificYear % 4 === 0 && specificYear % 100 !== 0);
};
for (let positionIndex = 0; positionIndex < numericSequence.length; positionIndex += 2) {
    const initialCalendarYear = numericSequence[positionIndex];
    const finalCalendarYear = numericSequence[positionIndex + 1];
    if (initialCalendarYear === 0 && finalCalendarYear === 0) {
        break;
    }
    const spanOfYears = Array.from({ length: finalCalendarYear - initialCalendarYear + 1 }, (_, idx) => initialCalendarYear + idx);
    const identifiedLeapYears = spanOfYears.filter(evaluateLeapPossibility);
    let temporaryBlockString = "";
    if (iterationMarker > 0) {
        temporaryBlockString += "\n";
    }
    if (identifiedLeapYears.length === 0) {
        temporaryBlockString += "NA\n";
    } else {
        temporaryBlockString += identifiedLeapYears.map(String).join("\n") + "\n";
    }
    if (iterationMarker > 0) {
        temporaryBlockString += "\n";
    }
    generatedOutputComponents.push(temporaryBlockString);
    iterationMarker++;
}
process.stdout.write(generatedOutputComponents.join(''));