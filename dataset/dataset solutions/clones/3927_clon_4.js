'use strict'

// Replaces Input class and 'input' instance
const obtainInputData = (() => {
    let dataBuffer;
    let dataReadPointer = 0;

    const prepareSourceData = () => {
        dataBuffer = require("fs").readFileSync("/dev/stdin", "utf8").split('\n');
    };

    const retrieveNextSegment = (segmentLength = 1) => {
        if (!dataBuffer) prepareSourceData();
        if (segmentLength === 1) {
            return dataBuffer[dataReadPointer++];
        } else {
            const collectedSegments = dataBuffer.slice(dataReadPointer, dataReadPointer + segmentLength);
            dataReadPointer += segmentLength;
            return collectedSegments;
        }
    };

    return {
        acquireNumericValue: () => parseInt(retrieveNextSegment()),
        acquireNumericPairs: (pairCount) => retrieveNextSegment(pairCount).map(lineContent => lineContent.split(' ').map(Number))
    };
})();

// Replaces Mod class and 'MOD' instance
const arithmeticOperations = (() => {
    const defaultCalculationModulus = 1000000007; // Corresponds to 1e9+7

    const multiplyValuesMod = (operandOne, operandTwo) => {
        let outcome = 0;
        operandOne %= defaultCalculationModulus;
        operandTwo %= defaultCalculationModulus;
        while (operandTwo > 0) {
            if (operandTwo & 1) {
                outcome = (outcome + operandOne) % defaultCalculationModulus;
            }
            operandOne = (operandOne * 2) % defaultCalculationModulus;
            operandTwo >>= 1;
        }
        return outcome;
    };

    const exponentiateValueMod = (baseElement, powerIndicator) => {
        let outcome = 1;
        while (powerIndicator > 0) {
            if (powerIndicator & 1) {
                outcome = multiplyValuesMod(outcome, baseElement);
            }
            baseElement = multiplyValuesMod(baseElement, baseElement);
            powerIndicator >>= 1;
        }
        return outcome;
    };

    const divideValuesMod = (dividendValue, divisorValue) => {
        return multiplyValuesMod(dividendValue, exponentiateValueMod(divisorValue, defaultCalculationModulus - 2));
    };

    return {
        getModulusConstant: () => defaultCalculationModulus,
        performModularMultiplication: multiplyValuesMod,
        performModularExponentiation: exponentiateValueMod,
        performModularDivision: divideValuesMod,
    };
})();

// Replaces Underscore class (its 'sum' and 'min' methods are now inlined in the main logic)

// Replaces Out class and 'out' instance
const displayResult = ((outputConfiguration) => {
    const presentOutputMessage = (contentToDisplay) => {
        if (contentToDisplay == null) return;
        let finalRender;
        if (contentToDisplay === true) finalRender = outputConfiguration.truthyStatement;
        else if (contentToDisplay === false) finalRender = outputConfiguration.falsyStatement;
        else finalRender = contentToDisplay;
        console.log(finalRender);
    };
    return {
        showComputedResult: presentOutputMessage,
        setBooleanRepresentations: (pairOfStrings) => { outputConfiguration.falsyStatement = pairOfStrings[0]; outputConfiguration.truthyStatement = pairOfStrings[1]; return this; }
    };
})({ truthyStatement: 'Yes', falsyStatement: 'No' });

// Replaces Main.solve() method with an imperative function
function performCoreCalculation() {
    const totalItemCount = obtainInputData.acquireNumericValue();
    const pairedNumericInputs = obtainInputData.acquireNumericPairs(totalItemCount);

    let allElementsAreIdentical = true;
    for (let k = 0; k < totalItemCount; ++k) {
        if (pairedNumericInputs[k][0] !== pairedNumericInputs[k][1]) {
            allElementsAreIdentical = false;
            break;
        }
    }
    if (allElementsAreIdentical) {
        return 0;
    }

    let initialSummation = 0;
    let subsequentValuesFromDominantPairs = [];

    for (let k = 0; k < totalItemCount; ++k) {
        const firstElement = pairedNumericInputs[k][0];
        const secondElement = pairedNumericInputs[k][1];

        initialSummation += firstElement;

        if (firstElement > secondElement) {
            subsequentValuesFromDominantPairs.push(secondElement);
        }
    }

    if (initialSummation === subsequentValuesFromDominantPairs.length) {
        return 0;
    } else {
        // At this point, 'subsequentValuesFromDominantPairs' must contain elements
        // for the original code to not crash (due to _.min on empty array).
        // Therefore, we can safely find the minimum.
        let smallestSubsequentValue = subsequentValuesFromDominantPairs[0];
        for (let j = 1; j < subsequentValuesFromDominantPairs.length; ++j) {
            if (subsequentValuesFromDominantPairs[j] < smallestSubsequentValue) {
                smallestSubsequentValue = subsequentValuesFromDominantPairs[j];
            }
        }
        return smallestSubsequentValue;
    }
}

// Execution entry point
displayResult.showComputedResult(performCoreCalculation());