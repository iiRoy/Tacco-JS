const retrieveSourceData = async () => {
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    const obtainedLines = [];
    const lineProcessor = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    lineProcessor.on('line', (lineContent) => {
        obtainedLines.push(lineContent);
    });
    return new Promise((completionResolver) => {
        lineProcessor.on('close', () => {
            completionResolver(obtainedLines);
        });
    });
};

const processNumericalData = (inputLines) => {
    const principalValue = Number.parseInt(inputLines[0].split(' ')[0], 10);

    const determineComponentContribution = (dividend, trialDivisor) =>
        (dividend % trialDivisor === 0) ? (dividend / trialDivisor) - 1 : 0;

    const sequenceOfNaturals = (upperLimit) => Array.from({ length: upperLimit }, (_, index) => index + 1);

    // The original loop iterates 'u' such that 'u < Math.sqrt(N)'.
    // To replicate this for non-integer square roots, we need to ensure the upper bound
    // for our sequence generation is the largest integer strictly less than Math.sqrt(N).
    // Using a small epsilon ensures that if N is a perfect square, say 9, sqrt(9)=3,
    // then floor(3 - epsilon) = 2, so the range goes up to 2 (1, 2), which is correct.
    // If N is 12, sqrt(12) approx 3.46, floor(3.46 - epsilon) = 3, range up to 3 (1, 2, 3), also correct.
    const highestConsideredDivisor = Math.floor(Math.sqrt(principalValue) - 1e-9);

    const candidateDivisors = sequenceOfNaturals(highestConsideredDivisor);

    const finalAccumulation = candidateDivisors.reduce((currentSum, currentDivisor) =>
        currentSum + determineComponentContribution(principalValue, currentDivisor), 0);

    return [String(finalAccumulation)];
};

const initiateExecution = async () => {
    const rawInputContent = await retrieveSourceData();
    const computedResults = processNumericalData(rawInputContent);
    computedResults.forEach(outputLine => console.log(outputLine));
};

initiateExecution();