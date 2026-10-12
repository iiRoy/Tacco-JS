function calculateFactorial(number) {
    if (number === 0 || number === 1) {
        return 1;
    }

    let result = number;

    for (let factor = number - 1; factor > 1; factor--) {
        const previousResult = result;
        result = previousResult * factor;
    }

    return result;
}