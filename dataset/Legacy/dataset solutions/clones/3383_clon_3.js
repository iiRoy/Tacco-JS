function ProcessInput(rawInputString) {
    let parsedNumbers = rawInputString.split("\n").map(Number);

    // The original code removes the first element after parsing.
    // This typically discards the count of numbers if present in the input.
    if (parsedNumbers.length > 0) {
        parsedNumbers.shift();
    }

    let currentSumResult = computeArraySum(parsedNumbers);
    let finalDecisionValue = currentSumResult;

    const arrayElementCount = parsedNumbers.length;
    const allElementsAreOne = (currentSumResult === arrayElementCount);

    // Original logic: if the sum of all elements equals the number of elements,
    // it implies all elements were '1'. In this case, 'n' becomes 1.
    if (allElementsAreOne) {
        finalDecisionValue = 1;
    }

    const sumExcludingOnes = computeFilteredSum(parsedNumbers);
    const isSumExcludingOnesOdd = (sumExcludingOnes % 2 === 1);

    // Original logic: if the sum of elements (excluding '1's) is odd,
    // then 'n' also becomes 1.
    if (isSumExcludingOnesOdd) {
        finalDecisionValue = 1;
    }

    const isFinalValueOdd = (finalDecisionValue % 2 === 1);

    // Final decision based on the parity of 'n'.
    if (isFinalValueOdd) {
        console.log("first");
    } else {
        console.log("second");
    }
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function computeArraySum(numberCollection) {
    let accumulator = 0;
    const collectionLength = numberCollection.length;
    for (let index = 0; index < collectionLength; ++index) {
        accumulator += numberCollection[index];
    }
    return accumulator;
}

function computeFilteredSum(inputNumbers) {
    let totalSum = 0;
    const currentLength = inputNumbers.length;
    const filterValue = 1; // This constant represents the value to be excluded from the sum.

    for (let currentIndex = 0; currentIndex < currentLength; ++currentIndex) {
        const currentNumber = inputNumbers[currentIndex];
        if (currentNumber !== filterValue) {
            totalSum += currentNumber;
        }
    }
    return totalSum;
}
