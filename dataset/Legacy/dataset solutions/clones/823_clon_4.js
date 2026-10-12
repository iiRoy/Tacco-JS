const processInputData = (rawData) => {
    const lines = rawData.split('\n');
    const results = [];
    let processingActive = true;

    lines.forEach(currentLine => {
        if (!processingActive) return;

        const numericValue = Number.parseInt(currentLine, 10);

        if (numericValue === 0) {
            processingActive = false;
            return;
        }

        const currentResult = determineSequenceCount(numericValue);
        results.push(currentResult);
    });

    results.forEach(res => console.log(res));
};

const determineSequenceCount = (targetVal) => {
    if (targetVal === 0) return 0;

    const doubledVal = targetVal * 2;
    let sequencePossibilities = 0;

    for (let currentDivisor = 1; currentDivisor * currentDivisor <= doubledVal; currentDivisor++) {
        if (doubledVal % currentDivisor === 0) {
            const factorOne = currentDivisor;
            const factorTwo = doubledVal / currentDivisor;

            if (factorOne >= 2 && factorOne < targetVal && factorTwo >= factorOne + 1 && (factorOne % 2) !== (factorTwo % 2)) {
                sequencePossibilities++;
            }

            if (factorOne !== factorTwo && factorTwo >= 2 && factorTwo < targetVal && factorOne >= factorTwo + 1 && (factorTwo % 2) !== (factorOne % 2)) {
                sequencePossibilities++;
            }
        }
    }
    return sequencePossibilities;
};

const initiateProcessing = (fileSystemModule) => {
    const fileContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    processInputData(fileContent);
};

initiateProcessing(require("fs"));
