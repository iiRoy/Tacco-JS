function findMissingNumber(numbers) {
    const orderedNumbers = numbers
        .slice()
        .sort((a, b) => a - b);

    for (let i = 0; i < orderedNumbers.length; i++) {
        if (orderedNumbers[i] !== i) {
            return i;
        }
    }

    return orderedNumbers.length;
}