function calculateFactorial(number) {
    let result = 1;

    for (let factor = 2; factor <= number; factor++) {
        result *= factor;
    }

    return result;
}