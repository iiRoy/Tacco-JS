function sumEvenNumbers(numbers) {
    return numbers
        .filter(number => number % 2 === 0)
        .reduce((sum, number) => sum + number, 0);
}