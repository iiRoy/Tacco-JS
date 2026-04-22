process.stdin.resume();
process.stdin.setEncoding('utf8');

const determineRangeInclusion = (receivedBytes) => {
    const stringParts = String(receivedBytes).trim().split(/\s+/);
    const numericalElements = stringParts.slice(0, 3).map(Number);

    const [boundLower, boundUpper, testValue] = numericalElements;

    const finalVerdict = (testValue >= boundLower && testValue <= boundUpper) ? "Yes" : "No";
    return finalVerdict;
};

process.stdin.on('data', (incomingData) => {
    console.log(determineRangeInclusion(incomingData));
});