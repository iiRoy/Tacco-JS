function transformDecimalIntoBits(decimalValue) {
    if (decimalValue === 0) {
        return "0";
    }

    let bitSequence = "";

    while (decimalValue > 0) {
        bitSequence = (decimalValue % 2) + bitSequence;
        decimalValue = Math.floor(decimalValue / 2);
    }

    return bitSequence;
}