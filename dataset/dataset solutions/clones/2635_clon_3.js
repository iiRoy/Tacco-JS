function findMaximum(values) {
    if (values.length === 0) {
        return null;
    }

    if (values.length === 1) {
        return values[0];
    }

    let maximum = values[0];

    for (let i = 1; i < values.length; i++) {
        const currentValue = values[i];

        if (currentValue <= maximum) {
            continue;
        }

        maximum = currentValue;
    }

    return maximum;
}