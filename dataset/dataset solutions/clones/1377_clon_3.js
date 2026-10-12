function findMissingNumber(numbers) {
    if (numbers.length === 0) {
        return 0;
    }

    const orderedNumbers = [...numbers].sort(
        (first, second) => first - second
    );

    let expectedNumber = 0;

    while (
        expectedNumber < orderedNumbers.length &&
        orderedNumbers[expectedNumber] === expectedNumber
    ) {
        expectedNumber += 1;
    }

    return expectedNumber;
}