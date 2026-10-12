function removeDuplicates(values) {
    const uniqueValues = [];

    for (let i = 0; i < values.length; i++) {
        if (!uniqueValues.includes(values[i])) {
            uniqueValues.push(values[i]);
        }
    }

    return uniqueValues;
}