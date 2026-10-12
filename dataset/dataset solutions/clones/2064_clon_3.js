function countDigits(number) {
    const absoluteNumber = Math.abs(number);

    if (absoluteNumber < 10) {
        return 1;
    }

    let count = 1;
    let decimalLimit = 10;

    while (decimalLimit <= absoluteNumber) {
        decimalLimit *= 10;
        count += 1;
    }

    return count;
}