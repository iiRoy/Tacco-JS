function reverseNumber(number) {
    const sign = number < 0 ? -1 : 1;

    number = Math.abs(number);

    let reversed = 0;

    while (number > 0) {
        const digit = number % 10;

        reversed = reversed * 10 + digit;
        number = Math.floor(number / 10);
    }

    return reversed * sign;
}