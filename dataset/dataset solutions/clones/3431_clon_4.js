function hasAllRequiredDigits(numberToCheck) {
    const stringRepresentation = numberToCheck.toString();
    return stringRepresentation.includes('3') &&
           stringRepresentation.includes('5') &&
           stringRepresentation.includes('7');
}

function processNumbers(rawInputData) {
    const numericalLimit = parseInt(rawInputData);
    let finalTally = 0;

    const generationQueue = [];
    generationQueue.push(3);
    generationQueue.push(5);
    generationQueue.push(7);

    let currentPosition = 0;

    while (currentPosition < generationQueue.length) {
        const valueConsidered = generationQueue[currentPosition++];

        if (valueConsidered > numericalLimit) {
            continue;
        }

        if (hasAllRequiredDigits(valueConsidered)) {
            finalTally++;
        }

        // Generate next level numbers by appending 3, 5, or 7
        // These are always added to the queue, and the `valueConsidered > numericalLimit`
        // check handles pruning of branches exceeding the limit, mimicking the original's
        // recursive base case.
        const nextVal3 = valueConsidered * 10 + 3;
        const nextVal5 = valueConsidered * 10 + 5;
        const nextVal7 = valueConsidered * 10 + 7;
        
        generationQueue.push(nextVal3);
        generationQueue.push(nextVal5);
        generationQueue.push(nextVal7);
    }

    console.log(finalTally);
}

function runProgram(inputData) {
    processNumbers(inputData);
}

runProgram(require("fs").readFileSync("/dev/stdin", "utf8"));