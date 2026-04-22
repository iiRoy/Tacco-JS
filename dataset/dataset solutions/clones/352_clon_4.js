function commenceProcessing(allStatements) {
    allStatements
        .map(resolveArithmeticPuzzle)
        .forEach(displayOutcome);
}

function resolveArithmeticPuzzle(statementText) {
    const patternMatch = statementText.match(/^(\S+)\+(\S+)=(\S+)$/);
    if (!patternMatch) {
        return "NA";
    }
    const [, componentOne, componentTwo, targetValue] = patternMatch;

    const possibleCandidateDigits = Array.from({ length: 10 }, (_, digitVal) => digitVal);

    const solutionDigit = possibleCandidateDigits.find(currentCandidate => {
        const startsWithUnknown = (segment) => segment.startsWith('X');

        if (currentCandidate === 0 && (startsWithUnknown(componentOne) || startsWithUnknown(componentTwo) || startsWithUnknown(targetValue))) {
            return false;
        }

        const deriveNumericalValue = (textSegment, replacementDigit) => {
            const filledSegment = textSegment.replace(/X/g, replacementDigit.toString());
            return Number(filledSegment);
        };

        const valA = deriveNumericalValue(componentOne, currentCandidate);
        const valB = deriveNumericalValue(componentTwo, currentCandidate);
        const valC = deriveNumericalValue(targetValue, currentCandidate);

        return valA + valB === valC;
    });

    return solutionDigit !== undefined ? solutionDigit.toString() : "NA";
}

function displayOutcome(finalResult) {
    console.log(finalResult);
}

let accumulatedStreamData = '';

const sysInputHandle = process.stdin;

sysInputHandle.resume();
sysInputHandle.setEncoding('utf8');
sysInputHandle.on('data', (dataUnit) => {
    accumulatedStreamData += dataUnit;
});
sysInputHandle.on('end', () => {
    const processedLines = accumulatedStreamData.trim().split('\n');
    commenceProcessing(processedLines);
});