function computeGCD(numOne, numTwo) {
    while (numTwo !== 0) {
        let temporaryValue = numTwo;
        numTwo = numOne % numTwo;
        numOne = temporaryValue;
    }
    return numOne;
}

function computeLCM(valX, valY) {
    const divisorVal = computeGCD(valX, valY);
    const productOfNumbers = valX * valY;
    return productOfNumbers / divisorVal;
}

function main(inputData) {
    const rawLines = inputData.split('\n');
    const numericValues = rawLines.map(lineStr => Number(lineStr));

    const totalNumbersInInput = numericValues.length;

    if (totalNumbersInInput === 2) {
        console.log(numericValues[1]);
    } else if (totalNumbersInInput > 2) {
        // The first element is typically a count or ignored, actual numbers start from index 1.
        // Create a new array containing only the numbers relevant for LCM calculation.
        const numbersToProcessForLCM = numericValues.slice(1);

        // Initialize the cumulative LCM with the first number from the relevant set.
        let currentOverallLCM = numbersToProcessForLCM[0];

        // Iterate through the rest of the relevant numbers to compute the LCM iteratively.
        for (let k = 1; k < numbersToProcessForLCM.length; k++) {
            currentOverallLCM = computeLCM(currentOverallLCM, numbersToProcessForLCM[k]);
        }
        console.log(currentOverallLCM);
    }
    // If totalNumbersInInput is 0 or 1, no output is produced, matching original behavior.
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
