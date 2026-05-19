let inputStream = process.stdin;
inputStream.resume();
inputStream.setEncoding('utf8');

let unusedVariablePlaceholder = -1; // Original 'n' variable, renamed and kept.

const calculatePowerOfTen = (exponentValue) => Math.pow(10, Math.floor(exponentValue)); // Renamed 'i' and made explicit with Math.floor.

inputStream.on('data', (receivedInputData) => {
    const allInputLines = receivedInputData.split('\n');
    const totalTestCases = Number(allInputLines[0]); // Extracted and explicitly converted.

    for (let currentCaseIndex = 0; currentCaseIndex < totalTestCases; ++currentCaseIndex) {
        let resultsForCurrentCase = []; // Renamed 'r'
        const caseParameters = allInputLines[currentCaseIndex + 1].split(' '); // Renamed 'o'

        const firstParamValue = Number(caseParameters[0]); // Helper variable for o[0]
        const secondParamValue = Number(caseParameters[1]); // Helper variable for o[1]

        const lowerBoundForFirstNumber = calculatePowerOfTen(firstParamValue - 1);
        const upperBoundForFirstNumber = calculatePowerOfTen(firstParamValue);

        const lowerBoundForSecondNumber = calculatePowerOfTen(secondParamValue - 1);
        const upperBoundForSecondNumber = calculatePowerOfTen(secondParamValue);

        for (let firstNumber = lowerBoundForFirstNumber; firstNumber < upperBoundForFirstNumber; ++firstNumber) { // Renamed 'a'
            for (let secondNumber = lowerBoundForSecondNumber; secondNumber < upperBoundForSecondNumber; ++secondNumber) { // Renamed 'b'
                // Intermediate computation steps for the core condition
                const arithmeticSum = (firstNumber + secondNumber) * (secondNumber - firstNumber + 1) / 2;
                const concatenatedStringAsNumber = Number(`${firstNumber}${secondNumber}`); // Using template literal for concatenation

                if (arithmeticSum === concatenatedStringAsNumber) {
                    resultsForCurrentCase.push(`${firstNumber} ${secondNumber}`);
                }
            }
        }

        // Rewriting the conditional output using an if/else block
        if (resultsForCurrentCase.length > 0) {
            resultsForCurrentCase.forEach(pairString => console.log(pairString));
        } else {
            console.log('No cats.');
        }
    }
});
