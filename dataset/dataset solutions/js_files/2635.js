function findMaximum(values) {
    if (values.length === 0) {
        return null;
    }

    let maximum = values[0];

    for (let i = 1; i < values.length; i++) {
        if (values[i] > maximum) {
            maximum = values[i];
        }
    }

    return maximum;
}