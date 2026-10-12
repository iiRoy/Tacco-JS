function determineCommonLeadingSection(values) {
    if (values.length === 0) {
        return "";
    }

    const orderedValues = [...values].sort();

    const firstValue = orderedValues[0];
    const lastValue =
        orderedValues[orderedValues.length - 1];

    const comparisonLimit = Math.min(
        firstValue.length,
        lastValue.length
    );

    let matchingLength = 0;

    while (
        matchingLength < comparisonLimit &&
        firstValue[matchingLength] === lastValue[matchingLength]
    ) {
        matchingLength++;
    }

    return firstValue.substring(0, matchingLength);
}