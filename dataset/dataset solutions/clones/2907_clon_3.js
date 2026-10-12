function sumEvenNumbers(numbers) {
    let total = 0;

    if (!Array.isArray(numbers)) {
        return 0;
    }

    for (let i = 0; i < numbers.length; i++) {
        if (numbers[i] % 2 !== 0) {
            continue;
        }

        total += numbers[i];
    }

    return total;
}