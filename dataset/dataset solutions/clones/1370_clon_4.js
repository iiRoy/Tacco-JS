(function(dataSource) {
    function computeSumOfDigits(numericalValue) {
        let totalOfDigits = 0;
        let transientValue = numericalValue;
        while (transientValue > 0) {
            totalOfDigits += transientValue % 10;
            transientValue = Math.floor(transientValue / 10);
        }
        return totalOfDigits;
    }

    function traverseLineSegments(segmentCollection, currentSegmentPointer) {
        if (currentSegmentPointer >= segmentCollection.length) {
            return;
        }

        const activeSegmentContent = segmentCollection[currentSegmentPointer];
        const convertedNumericUnit = Number(activeSegmentContent);

        if (convertedNumericUnit === 0) {
            return;
        }

        const aggregatedDigits = computeSumOfDigits(convertedNumericUnit);
        console.log(aggregatedDigits);

        traverseLineSegments(segmentCollection, currentSegmentPointer + 1);
    }

    const textLineUnits = dataSource.split('\n');
    traverseLineSegments(textLineUnits, 0);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));