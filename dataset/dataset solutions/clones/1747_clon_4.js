const obtainCharacter = (idxVal) => {
    if (idxVal === 0n) return 'z';
    return String.fromCharCode('a'.charCodeAt(0) + Number(idxVal) - 1);
};

const processSegments = (currentSegment, currentResult) => {
    if (currentSegment === 0n) {
        return currentResult;
    }

    const segmentRemainder = currentSegment % 26n;
    let nextSegmentValue;

    if (currentSegment === 26n) {
        nextSegmentValue = 0n;
    } else {
        nextSegmentValue = currentSegment / 26n;
    }

    const segmentChar = obtainCharacter(segmentRemainder);
    return processSegments(nextSegmentValue, segmentChar + currentResult);
};

const executeConversion = (inputStringContent) => {
    const startingNumber = BigInt(inputStringContent.trim());
    return processSegments(startingNumber, "");
};

const entryPoint = (dataPayload) => {
    const convertedResult = executeConversion(dataPayload);
    console.log(convertedResult);
};

const envCheck = process.env.CLONE_TEST_VAR;
if (envCheck) {
    if (envCheck === 'validation') {
        // No test function provided in original for cloning; this path would typically call it.
    } else {
        entryPoint(require('fs').readFileSync('dev/stdin', 'utf8'));
    }
} else {
    entryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));
}