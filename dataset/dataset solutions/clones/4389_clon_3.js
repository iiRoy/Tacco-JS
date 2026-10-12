function sumUpTo(number) {
    if (number <= 0) {
        return 0;
    }

    let total = number;
    let current = number - 1;

    while (current > 0) {
        total = total + current;
        current -= 1;
    }

    return total;
}