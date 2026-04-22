let accumulatedInput = '';

process.stdin.on('data', (chunk) => {
    accumulatedInput += chunk.toString();
});

process.stdin.on('end', () => {
    const evaluateExpenditure = () => {
        const firstLineNumericalStringMatch = accumulatedInput.match(/^(\d+\s+\d+\s+\d+\s+\d+\s+\d+)/);

        if (!firstLineNumericalStringMatch) {
            process.stderr.write("Input format error: Could not find required numerical sequence.\n");
            process.exit(1);
        }

        const numericalTextContent = firstLineNumericalStringMatch[1];
        
        const parsedNumericalElements = numericalTextContent.match(/\d+/g).map(textualDigit => parseInt(textualDigit, 10));

        const [
            targetQuantity,
            supplierOneUnitSize,
            supplierOneUnitCost,
            supplierTwoUnitSize,
            supplierTwoUnitCost
        ] = parsedNumericalElements;

        const calculateVendorCost = (requiredAmount, itemMagnitude, itemPrice) => {
            if (itemMagnitude === 0) {
                return requiredAmount === 0 ? 0 : Number.POSITIVE_INFINITY;
            }
            
            const batchesRequired = (requiredAmount + itemMagnitude - 1) / itemMagnitude | 0;
            
            return batchesRequired * itemPrice;
        };

        const optionAExpenditure = calculateVendorCost(targetQuantity, supplierOneUnitSize, supplierOneUnitCost);
        const optionBExpenditure = calculateVendorCost(targetQuantity, supplierTwoUnitSize, supplierTwoUnitCost);

        const ultimateMinimumExpense = (optionAExpenditure < optionBExpenditure) ? optionAExpenditure : optionBExpenditure;

        process.stdout.write(String(ultimateMinimumExpense) + '\n');
    };

    evaluateExpenditure();
});