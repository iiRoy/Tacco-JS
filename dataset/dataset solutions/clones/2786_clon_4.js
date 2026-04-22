'use strict';
((obtainDataMechanism) => {
    const fullTextContent = obtainDataMechanism();
    const segmentedTextLines = fullTextContent.toString().trim().split('\n');

    const expectedElementCount = parseInt(segmentedTextLines[0], 10);
    const unprocessedNumericalCollection = segmentedTextLines[1]
        .split(/\s+/)
        .filter(Boolean)
        .map(strValue => Number(strValue));

    const numericalComparisonRoutine = (valA, valB) => {
        if (valA < valB) {
            return -1;
        } else if (valA > valB) {
            return 1;
        }
        return 0;
    };

    const orderedNumericalCollection = unprocessedNumericalCollection.sort(numericalComparisonRoutine);

    const highIndexPosition = expectedElementCount / 2;
    const lowIndexPosition = highIndexPosition - 1;

    const highValue = orderedNumericalCollection.slice(highIndexPosition, highIndexPosition + 1)[0];
    const lowValue = orderedNumericalCollection.slice(lowIndexPosition, lowIndexPosition + 1)[0];

    console.log(highValue - lowValue);

})(function() {
    return require('node:fs').readFileSync('/dev/stdin', 'utf8');
});