const processNumericalSequence = (sourceData) => {
    const dataLines = sourceData.split("\n");
    const elementCount = Number(dataLines[0]);
    const numericalElements = dataLines[1].split(" ").map(Number);

    const initialProcessingState = {
        digitCollection: Array(numericalElements[0]).fill(1),
        currentCondition: 0,
        resultantMetric: 1,
        lastProcessedElement: numericalElements[0]
    };

    const applyStateTransition = (currentProcessingState, currentElementValue) => {
        let { digitCollection, currentCondition, resultantMetric, lastProcessedElement } = currentProcessingState;

        let nextDigitCollection = [...digitCollection];
        let nextCondition = currentCondition;
        let nextResultantMetric = resultantMetric;

        // Step 1: Adjust digit collection length based on comparison with previous element
        if (currentElementValue < lastProcessedElement) {
            nextDigitCollection = nextDigitCollection.slice(0, currentElementValue);
        }

        // Step 2: Evaluate and update condition if in an expansion phase (condition 2)
        if (nextCondition === 2) {
            const leadingDigit = nextDigitCollection[0];
            const allDigitsIdentical = nextDigitCollection.every(item => item === leadingDigit);
            nextCondition = allDigitsIdentical ? 0 : 1;
        }

        // Step 3: Apply core logic based on element comparison and current condition
        if (currentElementValue > lastProcessedElement) {
            // Expand digit collection by adding ones
            Array.prototype.push.apply(nextDigitCollection, Array(currentElementValue - lastProcessedElement).fill(1));
            nextCondition = 2; // Transition to expansion condition
        } else if (nextCondition === 0) { // Normal increment condition
            // Increment the digit at the specific position
            nextDigitCollection[currentElementValue - 1] = (nextDigitCollection[currentElementValue - 1] || 0) + 1;
            // Trim digit collection to current element value length
            nextDigitCollection = nextDigitCollection.slice(0, currentElementValue);
            if (nextDigitCollection.length !== 1) {
                nextCondition = 1; // Transition to carry-over condition
                nextResultantMetric++; // Increment the metric
            }
        } else if (nextCondition === 1) { // Carry-over propagation condition
            // Trim digit collection to current element value length
            nextDigitCollection = nextDigitCollection.slice(0, currentElementValue);
            
            // Iterate digits in reverse to propagate carry
            Array.from({ length: currentElementValue }, (_, idx) => currentElementValue - 1 - idx)
                .some(targetIndex => {
                    if (nextDigitCollection[targetIndex] === nextResultantMetric) {
                        nextDigitCollection[targetIndex] = 1; // Reset digit
                        return false; // Continue iterating
                    } else {
                        nextDigitCollection[targetIndex] = nextDigitCollection[targetIndex] + 1; // Increment digit
                        nextCondition = 2; // Transition to expansion condition after carry
                        return true; // Stop iterating (break)
                    }
                });
        }

        return {
            digitCollection: nextDigitCollection,
            currentCondition: nextCondition,
            resultantMetric: nextResultantMetric,
            lastProcessedElement: currentElementValue
        };
    };

    // Process the numerical elements starting from the second one
    const finalProcessedState = numericalElements.slice(1).reduce(applyStateTransition, initialProcessingState);

    console.log(finalProcessedState.resultantMetric.toString());
};

processNumericalSequence(require("fs").readFileSync("/dev/stdin", "utf8"));