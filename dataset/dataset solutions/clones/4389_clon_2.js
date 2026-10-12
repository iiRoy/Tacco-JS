function accumulateUntil(limit) {
    let accumulatedValue = 0;

    for (
        let currentInteger = 1;
        currentInteger <= limit;
        currentInteger++
    ) {
        accumulatedValue += currentInteger;
    }

    return accumulatedValue;
}