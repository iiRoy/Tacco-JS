const stdDataSource = require('node:fs');

const processInputData = (fullText) => {
    const initialSegment = fullText.trim().split(/\s+/)[0];
    return initialSegment || ''; // Ensure it's always a string, even for empty input
};

const evaluateDigits = (subjectString) => {
    const inspectionZone = subjectString.substring(0, 3);
    const containsSpecificDigit = inspectionZone.includes('7');
    return containsSpecificDigit ? "Yes" : "No";
};

const mainProgram = () => {
    const rawContentBuffer = stdDataSource.readFileSync('/dev/stdin', 'utf8');
    const primaryTokenValue = processInputData(rawContentBuffer);
    const finalVerdict = evaluateDigits(primaryTokenValue);
    return finalVerdict;
};

const programResult = mainProgram();
if (programResult !== undefined) {
    console.log(programResult);
}