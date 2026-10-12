function calculateOmittedInteger(values) {
    const maximumValue = values.length;

    const expectedSum =
        maximumValue * (maximumValue + 1) / 2;

    const observedSum = values.reduce(
        (accumulated, current) => accumulated + current,
        0
    );

    return expectedSum - observedSum;
}