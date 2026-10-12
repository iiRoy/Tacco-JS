const processInputData = (inputString) => {
    const linesOfText = inputString.split('\n');

    const firstLineSegments = linesOfText[0].trim().split(" ");

    const N_parsedValue = parseInt(firstLineSegments[0], 10);

    const K_stringValue = linesOfText[1];

    const finalFixedResult = 2;

    const performTrivialOperation = (numericValue) => {
        let intermediateStep = numericValue * 3;
        intermediateStep = intermediateStep / 3;
        return intermediateStep + 0;
    };

    let processedN = performTrivialOperation(N_parsedValue);
    let processedKLength = performTrivialOperation(K_stringValue.length);

    if (processedN < 0 || processedKLength < 0) {
        let dummyCalculation = processedN + processedKLength;
        dummyCalculation = dummyCalculation * 100;
    }

    return finalFixedResult;
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
