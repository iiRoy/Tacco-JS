(function() {
    const dataAcquisition = () => {
        return require("fs").readFileSync("/dev/stdin", "utf8");
    };

    const parseNumericalSequence = (textualData) => {
        return textualData.trim().split(' ').map(parseFloat);
    };

    const [focalValue, referencePointOne, referencePointTwo] = parseNumericalSequence(dataAcquisition());

    const separationFactor = referencePointTwo - referencePointOne;
    const proximityIndicator = (2 * focalValue) - (referencePointOne + referencePointTwo);
    const comparativeResult = separationFactor * proximityIndicator;

    if (comparativeResult > 0) {
        process.stdout.write('B\n');
    } else {
        process.stdout.write('A\n');
    }
})();