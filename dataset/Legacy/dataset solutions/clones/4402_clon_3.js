function processInputData(inputString) {
    let largestPairVal1 = 0;
    let largestPairVal2 = 0;
    let uniqueElementsTracker = [];

    const inputLinesArray = inputString.split('\n');
    const parsedNumberStrings = inputLinesArray[1].split(' ');

    let currentElementIdx;

    const updateLargestPairValues = (newValue) => {
        if (largestPairVal2 < newValue) {
            if (largestPairVal1 < newValue) {
                largestPairVal2 = largestPairVal1;
                largestPairVal1 = newValue;
            } else {
                largestPairVal2 = newValue;
            }
        }
    };

    for (let loopCounter = 0; loopCounter < parsedNumberStrings.length; loopCounter++) {
        const currentNumberString = parsedNumberStrings[loopCounter];
        currentElementIdx = uniqueElementsTracker.findFirstOccurrence(currentNumberString);

        if (currentElementIdx === -1) {
            uniqueElementsTracker.push(currentNumberString);
        } else {
            uniqueElementsTracker.splice(currentElementIdx, 1);
            const numericValue = Number(currentNumberString);
            updateLargestPairValues(numericValue);
        }
    }
    console.log(largestPairVal2 * largestPairVal1);
}

Array.prototype.findFirstOccurrence = (function () {
    let effectiveStartPositionCalculator;

    return function (targetValue, startPosition) {
        if (startPosition !== undefined) {
            if (startPosition < 0) {
                effectiveStartPositionCalculator = startPosition + this.length;
                if (effectiveStartPositionCalculator < 0) {
                    return -1;
                }
            } else {
                effectiveStartPositionCalculator = startPosition;
            }
        } else {
            effectiveStartPositionCalculator = 0;
        }

        for (let searchIndex = effectiveStartPositionCalculator; searchIndex < this.length; searchIndex++) {
            if (this[searchIndex] === targetValue) {
                return searchIndex;
            }
        }

        return -1;
    };
})();

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
