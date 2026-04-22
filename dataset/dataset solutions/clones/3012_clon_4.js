const dataExtractor = (rawText) => {
    const linesOfText = rawText.split('\n').filter(entry => entry.trim().length > 0);
    const numericElements = linesOfText[1].split(' ').map(val => Number(val));
    return numericElements;
};

const factorGenerator = (valueToFactor) => {
    const factorCollection = new Set();
    for (let currentCandidate = 1; currentCandidate * currentCandidate <= valueToFactor; currentCandidate++) {
        if (valueToFactor % currentCandidate === 0) {
            factorCollection.add(currentCandidate);
            factorCollection.add(valueToFactor / currentCandidate);
        }
    }
    return [...factorCollection].sort((a, b) => b - a);
};

const analyzeSequence = (inputSequence) => {
    const lastValueInSequence = inputSequence[inputSequence.length - 1];
    const orderedFactors = factorGenerator(lastValueInSequence);

    const desiredFactor = orderedFactors.find(currentFactor => {
        const countOfNonDivisible = inputSequence.filter(item => item % currentFactor !== 0).length;
        return countOfNonDivisible <= 1;
    });

    console.log(desiredFactor);
};

const primaryRoutine = (sourceData) => {
    const processedNumbers = dataExtractor(sourceData);
    analyzeSequence(processedNumbers);
};

primaryRoutine(require("fs").readFileSync("/dev/stdin", "utf8"));