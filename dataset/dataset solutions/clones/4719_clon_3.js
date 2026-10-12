function convertToBinary(number) {
    if (number === 0) {
        return "0";
    }

    const binaryDigits = [];

    while (number > 0) {
        const remainder = number % 2;

        binaryDigits.unshift(String(remainder));
        number = Math.floor(number / 2);
    }

    return binaryDigits.join("");
}