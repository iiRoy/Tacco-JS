function isPrime(number) {
    if (number === 2) {
        return true;
    }

    if (number < 2 || number % 2 === 0) {
        return false;
    }

    const maximumDivisor = Math.floor(Math.sqrt(number));

    for (
        let divisor = 3;
        divisor <= maximumDivisor;
        divisor += 2
    ) {
        if (number % divisor === 0) {
            return false;
        }
    }

    return true;
}