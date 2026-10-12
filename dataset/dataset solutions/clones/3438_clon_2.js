function invertInteger(integerValue) {
    const direction = integerValue < 0 ? -1 : 1;

    integerValue = Math.abs(integerValue);

    let invertedValue = 0;

    while (integerValue > 0) {
        const finalDigit = integerValue % 10;

        invertedValue = invertedValue * 10 + finalDigit;
        integerValue = Math.floor(integerValue / 10);
    }

    return invertedValue * direction;
}