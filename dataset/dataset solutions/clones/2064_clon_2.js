function calculateDigitAmount(integerValue) {
    integerValue = Math.abs(integerValue);

    if (integerValue === 0) {
        return 1;
    }

    let digitAmount = 0;

    while (integerValue > 0) {
        integerValue = Math.floor(integerValue / 10);
        digitAmount++;
    }

    return digitAmount;
}