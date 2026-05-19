function analyzeSequence(rawInputString) {
    const parseNumericInput = (inputStr) => {
        const stringParts = inputStr.split(' ');
        const numericData = stringParts.map(part => Number(part.trim()));
        return numericData;
    };

    const isArithmeticProgression = (val1, val2, val3) => {
        const diffBetweenFirstTwo = val2 - val1;
        const diffBetweenLastTwo = val3 - val2;
        const areDifferencesEqual = diffBetweenFirstTwo === diffBetweenLastTwo;
        return areDifferencesEqual;
    };

    const numericValuesArray = parseNumericInput(rawInputString);

    const firstTerm = numericValuesArray[0];
    const middleTerm = numericValuesArray[1];
    const lastTerm = numericValuesArray[2];

    const resultOfCheck = isArithmeticProgression(firstTerm, middleTerm, lastTerm);

    if (resultOfCheck) {
        console.log('YES');
    } else {
        console.log('NO');
    }
}

analyzeSequence(require('fs').readFileSync());
