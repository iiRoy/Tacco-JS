const processInput = (rawData) => {
    const lines = rawData.split("\n");
    const firstLineValues = lines[0].split(' ').map(Number);
    const collectionSize = firstLineValues[0];
    const numericCollection = lines[1].split(' ').map(Number);

    const referenceValue = numericCollection[collectionSize - 1];

    const generateOrderedDivisors = (num) => {
        return Array.from({ length: num }, (_, index) => index + 1)
                    .filter(candidate => num % candidate === 0)
                    .sort((a, b) => b - a);
    };

    const candidateDivisors = generateOrderedDivisors(referenceValue);

    const qualifyingDivisor = candidateDivisors.find(currentTestDivisor => {
        const nonConformingCount = numericCollection.reduce((tally, element) => {
            return tally + (element % currentTestDivisor !== 0 ? 1 : 0);
        }, 0);
        return nonConformingCount <= 1;
    });

    console.log(qualifyingDivisor);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
