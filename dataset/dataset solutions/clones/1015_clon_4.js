(function(rawText) {
    let movementCounter = 0;

    const extractData = (textualInput) => {
        const lines = textualInput.split('\n');
        const totalItems = parseInt(lines[0], 10);
        const itemCollection = lines.slice(1, totalItems + 1);
        return { totalItems, itemCollection };
    };
    const { totalItems, itemCollection } = extractData(rawText);

    const produceDecreasingIntervals = (collectionSize) => {
        let currentInterval = 1;
        const intervalList = [];
        while (currentInterval <= collectionSize) {
            intervalList.push(currentInterval);
            currentInterval *= 2;
        }
        return intervalList.reverse();
    };
    const stepsArray = produceDecreasingIntervals(itemCollection.length);

    const orchestrateSorting = (elements, intervals) => {
        intervals.forEach(stepValue => {
            // Recursive helper for g-insertion sort
            const performSubsortRecursive = (dataArr, currentGap, startIndex) => {
                if (startIndex >= dataArr.length) {
                    return; // Base case: end of the sub-array
                }

                const valueToInsert = dataArr[startIndex];
                let scanIndex = startIndex - currentGap;

                while (scanIndex >= 0 && dataArr[scanIndex] > valueToInsert) {
                    dataArr[scanIndex + currentGap] = dataArr[scanIndex];
                    scanIndex -= currentGap;
                    movementCounter++;
                }
                dataArr[scanIndex + currentGap] = valueToInsert;

                // Recursive step: move to the next element in the g-spaced sequence
                performSubsortRecursive(dataArr, currentGap, startIndex + currentGap);
            };

            // Start the recursive g-insertion sort for the current gap
            performSubsortRecursive(elements, stepValue, stepValue);
        });
    };

    orchestrateSorting(itemCollection, stepsArray);

    console.log(stepsArray.length);
    console.log(stepsArray.join(' '));
    console.log(movementCounter);
    console.log(itemCollection.join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));