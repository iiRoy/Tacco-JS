const fileSystem = require('fs');

const acquireInputContent = async () => {
    return new Promise(resolve => {
        const entireInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
        const contentLines = entireInput.trim().split('\n');
        resolve(contentLines);
    });
};

const computeResultValue = (inputSegments) => {
    const primaryValueString = inputSegments[0].split(" ").shift();
    const numericTarget = Number(primaryValueString);

    if (numericTarget <= 0) {
        return ["0"];
    }

    const searchCeiling = Math.floor(Math.sqrt(numericTarget));
    let iterationLimit;

    if (searchCeiling * searchCeiling === numericTarget) {
        iterationLimit = searchCeiling - 1;
    } else {
        iterationLimit = searchCeiling;
    }

    const relevantFactors = Array.from({ length: iterationLimit }, (_, idx) => idx + 1)
        .filter(potentialFactor => numericTarget % potentialFactor === 0);

    const accumulatedSum = relevantFactors.reduce((currentSum, currentFactor) => {
        return currentSum + (numericTarget / currentFactor) - 1;
    }, 0);

    return [String(accumulatedSum)];
};

(async () => {
    try {
        const receivedLines = await acquireInputContent();
        const processedOutput = computeResultValue(receivedLines);
        processedOutput.forEach(line => console.log(line));
    } catch (error) {
        console.error("An error occurred:", error);
    }
})();
