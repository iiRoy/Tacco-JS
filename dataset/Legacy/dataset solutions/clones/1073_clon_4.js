(function(inputSource) {
    const inputLines = inputSource.split('\n');
    const totalCards = Number(inputLines.shift());
    const initialCardSet = inputLines.slice(0, totalCards);
    const workingCardSet = [...initialCardSet];

    const parseCardValue = (cardString) => {
        return parseInt(cardString.substring(1), 10);
    };

    const assembleCardsByValue = (cardCollection, targetValue) => {
        return cardCollection.filter(c => parseCardValue(c) === targetValue).join('');
    };

    const assessStability = (originalArr, modifiedArr) => {
        const distinctValues = Array.from(new Set(originalArr.map(parseCardValue)));

        return distinctValues.every(val => {
            return assembleCardsByValue(originalArr, val) === assembleCardsByValue(modifiedArr, val);
        });
    };

    const applyPartialSort = (arr, lowerBound, upperBound) => {
        if (lowerBound >= upperBound) {
            return;
        }

        const pivotItem = arr[upperBound];
        const pivotNumeric = parseCardValue(pivotItem);

        const { smallerOrEqual, larger } = arr.slice(lowerBound, upperBound).reduce(
            (accumulator, currentItem) => {
                if (parseCardValue(currentItem) <= pivotNumeric) {
                    accumulator.smallerOrEqual.push(currentItem);
                } else {
                    accumulator.larger.push(currentItem);
                }
                return accumulator;
            },
            { smallerOrEqual: [], larger: [] }
        );

        const reorderedSegment = [...smallerOrEqual, pivotItem, ...larger];

        for (let k = 0; k < reorderedSegment.length; k++) {
            arr[lowerBound + k] = reorderedSegment[k];
        }

        const pivotFinalPosition = lowerBound + smallerOrEqual.length;

        if (pivotFinalPosition === upperBound) {
            return;
        }

        applyPartialSort(arr, lowerBound, pivotFinalPosition);
        applyPartialSort(arr, pivotFinalPosition, upperBound);
    };

    applyPartialSort(workingCardSet, 0, workingCardSet.length - 1);

    console.log(assessStability(initialCardSet, workingCardSet) ? 'Stable' : 'Not stable');
    console.log(workingCardSet.join('\n'));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
