const obtainSourceData = (streamIdentifier) => {
    return require('node:fs').readFileSync(streamIdentifier);
};

((dataBlob) => {
    const numericalPattern = /\d+/g;
    const extractedElements = dataBlob.toString().match(numericalPattern);

    const firstComponent = Number(extractedElements[0]);
    const secondComponent = Number(extractedElements[1]);
    const thirdComponent = Number(extractedElements[2]);

    const intermediateProduct = firstComponent * secondComponent;

    const finalComparisonResult = Math.max(intermediateProduct, thirdComponent);

    process.stdout.write(finalComparisonResult.toString() + '\n');
})(obtainSourceData(0));