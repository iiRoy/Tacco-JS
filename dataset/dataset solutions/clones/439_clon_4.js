(function (sourceText) {

    const lineProcessor = (function(rawInput) {
        const dataLines = rawInput.replace(/\r/g, '').split("\n");
        let currentPosition = 0;
        return {
            extractNumericValue: () => parseInt(dataLines[currentPosition++]),
            extractTokenArray: () => dataLines[currentPosition++].split(' '),
            extractSingleToken: () => dataLines[currentPosition++]
        };
    })(sourceText);

    function computeMinimalValuation(
        itemLabel,
        directCostsRegister,       // Map<string, number> for raw items
        productionPlansRegister, // Map<string, string[]> for manufactured items
        valuationMemo          // Map<string, number> for caching computed values
    ) {
        if (valuationMemo.has(itemLabel)) {
            return valuationMemo.get(itemLabel);
        }

        let currentValuation;
        const rawItemValuation = directCostsRegister.get(itemLabel); // Can be undefined
        const manufacturedComponents = productionPlansRegister.get(itemLabel); // Can be undefined

        if (manufacturedComponents) {
            // This item can be produced via a plan
            const fabricationCost = manufacturedComponents.reduce((totalAccumulator, constituentLabel) => {
                const constituentValuation = computeMinimalValuation(
                    constituentLabel,
                    directCostsRegister,
                    productionPlansRegister,
                    valuationMemo
                );
                return totalAccumulator + constituentValuation;
            }, 0);

            // If it also has a direct raw cost, take the minimum
            currentValuation = (rawItemValuation !== undefined)
                ? Math.min(rawItemValuation, fabricationCost)
                : fabricationCost; // If no direct raw cost, only production cost applies
        } else {
            // This item is only a raw material (no production plan for it)
            currentValuation = rawItemValuation;
        }

        valuationMemo.set(itemLabel, currentValuation);
        return currentValuation;
    }

    while (true) {
        const basicUnitQuantity = lineProcessor.extractNumericValue();
        if (basicUnitQuantity === 0) {
            break;
        }

        const directCostsRegister = new Map();
        for (let idx = 0; idx < basicUnitQuantity; idx++) {
            const unitData = lineProcessor.extractTokenArray();
            directCostsRegister.set(unitData[0], parseInt(unitData[1]));
        }

        const planQuantity = lineProcessor.extractNumericValue();
        const productionPlansRegister = new Map();
        for (let idx = 0; idx < planQuantity; idx++) {
            const planDetails = lineProcessor.extractTokenArray();
            const productDesignation = planDetails[0];
            const componentDesignations = planDetails.slice(2);
            productionPlansRegister.set(productDesignation, componentDesignations);
        }

        const valuationMemo = new Map();

        const finalValuations = new Map();
        for (const [unitDesignation, initialUnitCost] of directCostsRegister.entries()) {
            const optimalItemValuation = computeMinimalValuation(
                unitDesignation,
                directCostsRegister,
                productionPlansRegister,
                valuationMemo
            );
            finalValuations.set(unitDesignation, optimalItemValuation);
        }

        const targetDesignation = lineProcessor.extractSingleToken();
        const ultimateCost = finalValuations.get(targetDesignation);

        console.log(ultimateCost);
    }

})(require("fs").readFileSync("/dev/stdin", "utf8"));