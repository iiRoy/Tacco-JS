function reverseNumber(number) {
    const sign = number < 0 ? -1 : 1;
    let remainingNumber = Math.abs(number);
    const extractedDigits = [];

    if (remainingNumber === 0) {
        return 0;
    }

    while (remainingNumber > 0) {
        const digit = remainingNumber % 10;

        extractedDigits.push(digit);
        remainingNumber = Math.floor(remainingNumber / 10);
    }

    const reversed = Number(extractedDigits.join(""));

    return sign * reversed;
}