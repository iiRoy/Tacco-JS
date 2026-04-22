function calcFinalValue(rawInputText) {
    const lineSegments = rawInputText.split('\n');

    const initialCount = parseInt(lineSegments[0], 10);

    let currentSum = 0;
    for (let j = 1; j <= initialCount; j++) {
        currentSum += parseInt(lineSegments[j], 10);
    }

    const mutableListRepresentation = lineSegments.slice();

    function performReduction(currentTotal, currentListState) {
        if (currentTotal <= 0) {
            return 0;
        }
        if (currentTotal % 10 !== 0) {
            return currentTotal;
        }

        let smallestConsideredValueAsString = "101";
        let foundRemovalIndex = -1;

        for (let k = 1; k < currentListState.length; k++) {
            if (foundRemovalIndex === -1) {
                if (parseInt(smallestConsideredValueAsString, 10) > parseInt(currentListState[k], 10)) {
                    smallestConsideredValueAsString = currentListState[k];
                    foundRemovalIndex = k;
                }
            } else {
                if (smallestConsideredValueAsString > currentListState[k]) {
                    smallestConsideredValueAsString = currentListState[k];
                    foundRemovalIndex = k;
                }
            }
        }

        let amountToSubtract;
        let nextListState;

        if (foundRemovalIndex !== -1) {
            amountToSubtract = parseInt(smallestConsideredValueAsString, 10);
            nextListState = currentListState.filter((_, idx) => idx !== foundRemovalIndex);
        } else {
            amountToSubtract = 101;
            if (currentListState.length > 0) {
                nextListState = currentListState.slice(0, currentListState.length - 1);
            } else {
                nextListState = [];
            }
        }

        const updatedTotal = currentTotal - amountToSubtract;
        return performReduction(updatedTotal, nextListState);
    }

    const finalCalculatedValue = performReduction(currentSum, mutableListRepresentation);

    console.log(finalCalculatedValue);
}

calcFinalValue(require("fs").readFileSync("/dev/stdin", "utf8"));