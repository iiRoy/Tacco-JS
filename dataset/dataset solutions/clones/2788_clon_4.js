(function() {
    function orderElements(collection) {
        const totalItems = collection.length;
        for (let currentPosition = 0; currentPosition < totalItems - 1; currentPosition++) {
            let smallestElementIndex = currentPosition;
            for (let comparisonPosition = currentPosition + 1; comparisonPosition < totalItems; comparisonPosition++) {
                if (collection[comparisonPosition] < collection[smallestElementIndex]) {
                    smallestElementIndex = comparisonPosition;
                }
            }
            if (smallestElementIndex !== currentPosition) {
                let temporaryValue = collection[currentPosition];
                collection[currentPosition] = collection[smallestElementIndex];
                collection[smallestElementIndex] = temporaryValue;
            }
        }
        return collection;
    }

    function processInputContent(receivedText) {
        const cleanedText = receivedText.replace(/^\s+|\s+$/g, '');
        const dataRows = cleanedText.split('\n');
        const numberStrings = dataRows[1].split(/\s+/).filter(Boolean);
        const numericalValues = numberStrings.map(str => Number(str));

        const dataLength = numericalValues.length;
        const arrangedValues = orderElements([...numericalValues]);

        const firstTargetIndex = Math.floor(dataLength / 2);
        const secondTargetIndex = firstTargetIndex + 1;

        const calculatedDifference = arrangedValues[secondTargetIndex] - arrangedValues[firstTargetIndex];
        console.log(calculatedDifference);
    }

    processInputContent(require('fs').readFileSync('/dev/stdin', 'utf8'));
})();