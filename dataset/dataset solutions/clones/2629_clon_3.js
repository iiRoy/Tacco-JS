function removeDuplicates(values) {
    if (values.length < 2) {
        return values.slice();
    }

    const uniqueValues = [];
    const observedValues = new Set();

    for (let i = 0; i < values.length; i++) {
        const currentValue = values[i];

        if (observedValues.has(currentValue)) {
            continue;
        }

        observedValues.add(currentValue);
        uniqueValues.push(currentValue);
    }

    return uniqueValues;
}