function calculateQualifiedSeries(sourceData) {
    const quantitativeBoundary = Number.parseInt(sourceData.split("\n")[0], 10);
    let cumulativeSum = 0;
    let terminationSignal = false;
    const constituentNumerals = ['3', '5', '7'];

    function exploreNumericalPaths(currentSequence, hasComponent3, hasComponent5, hasComponent7, boundaryValue) {
        if (terminationSignal) {
            return;
        }

        if (currentSequence.length > 0 && hasComponent3 && hasComponent5 && hasComponent7) {
            const evaluatedMagnitude = Number.parseInt(currentSequence, 10);
            if (evaluatedMagnitude > boundaryValue) {
                terminationSignal = true;
                return;
            }
            cumulativeSum++;
        }

        if (currentSequence.length >= 9) {
            return;
        }

        for (const unit of constituentNumerals) {
            if (terminationSignal) {
                return;
            }
            const subsequentSequence = currentSequence + unit;
            const nextHas3 = hasComponent3 || (unit === '3');
            const nextHas5 = hasComponent5 || (unit === '5');
            const nextHas7 = hasComponent7 || (unit === '7');

            exploreNumericalPaths(subsequentSequence, nextHas3, nextHas5, nextHas7, boundaryValue);
        }
    }

    exploreNumericalPaths("", false, false, false, quantitativeBoundary);

    return cumulativeSum;
}