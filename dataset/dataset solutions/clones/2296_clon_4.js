'use strict';
(function() {
    const acquireInputData = () => require("node:fs").readFileSync("/dev/stdin", "utf8");

    const parseNumericComponents = (textualLine) => {
        const potentialValues = textualLine.match(/\d+/g);
        if (!potentialValues || potentialValues.length < 3) {
            throw new Error("Insufficient numeric elements detected in input.");
        }
        return potentialValues.slice(0, 3).map(component => parseInt(component, 10));
    };

    const determineAllocations = (primaryResource, secondaryResource, costThreshold) => {
        let firstAllocationResult;
        let secondAllocationResult;

        if (primaryResource > costThreshold) {
            firstAllocationResult = primaryResource - costThreshold;
            secondAllocationResult = secondaryResource;
        } else {
            firstAllocationResult = 0;
            const remainingCost = costThreshold - primaryResource;
            if (secondaryResource > remainingCost) {
                secondAllocationResult = secondaryResource - remainingCost;
            } else {
                secondAllocationResult = 0;
            }
        }
        return [firstAllocationResult, secondAllocationResult];
    };

    const sourceContent = acquireInputData();
    const initialLine = sourceContent.split('\n')[0];
    const [valueAlpha, valueBeta, valueGamma] = parseNumericComponents(initialLine);

    const finalCalculations = determineAllocations(valueAlpha, valueBeta, valueGamma);

    console.log(finalCalculations[0], finalCalculations[1]);
})();