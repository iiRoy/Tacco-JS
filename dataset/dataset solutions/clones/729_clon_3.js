const processInputData = (rawData) => {
    // Define a constant for the base percentage, enhancing readability and maintainability.
    const PERCENT_BASE = 100;

    // Helper function to find the original price ('b' in the original logic).
    // It seeks the largest integer 'baseAmount' such that floor(baseAmount * (100 + taxRate) / 100) equals 'targetValue'.
    // Returns an object { value: number, isValid: boolean }
    const determinePreTaxPrice = (targetValue, taxRate) => {
        const taxMultiplier = (PERCENT_BASE + taxRate) / PERCENT_BASE;
        let baseAmountCandidate = Math.floor(targetValue / taxMultiplier) + 1;

        // Iterate downwards to find the largest integer baseAmountCandidate
        // that, when taxed, yields the targetValue without exceeding it by one.
        while (Math.floor(baseAmountCandidate * taxMultiplier) >= targetValue + 1) {
            baseAmountCandidate--;
        }

        // If, after adjustments, the calculated taxed value is less than the target,
        // it means no valid integer baseAmountCandidate exists for this target.
        if (Math.floor(baseAmountCandidate * taxMultiplier) < targetValue) {
            return { value: -1, isValid: false }; // Indicate an invalid combination
        }
        return { value: baseAmountCandidate, isValid: true };
    };

    // Helper function to calculate the final value ('c' in the original logic) after a second tax.
    const calculatePostTaxValue = (preTaxPrice, taxRate) => {
        const taxMultiplier = (PERCENT_BASE + taxRate) / PERCENT_BASE;
        let finalPriceComponent = Math.floor(preTaxPrice * taxMultiplier);

        // Adjust for cases where the multiplication results in an exact integer,
        // but floor might have rounded down if the result was X.000... (e.g., 99.99999999999999 -> 99, should be 100).
        if (finalPriceComponent + 1 === preTaxPrice * taxMultiplier) {
            finalPriceComponent++;
        }
        return finalPriceComponent;
    };

    // Split the entire input string into individual lines.
    const dataLines = rawData.split("\n");
    let currentLineIndex = 0;

    // Process each line of input until a termination condition is met.
    for (;;) {
        // Retrieve the current line and parse its components.
        // If the line is empty or undefined, it's an unexpected end of input, so break.
        if (currentLineIndex >= dataLines.length || !dataLines[currentLineIndex]) {
            break;
        }
        const lineSegments = dataLines[currentLineIndex].split(" ");
        currentLineIndex++; // Move to the next line for the subsequent iteration

        // Parse the three numerical parameters from the current line.
        const firstRate = parseInt(lineSegments[0], 10);
        const secondRate = parseInt(lineSegments[1], 10);
        const totalValueS = parseInt(lineSegments[2], 10);

        // Termination condition: If all three parsed values are zero, exit the loop.
        if (firstRate === 0 && secondRate === 0 && totalValueS === 0) {
            break;
        }

        // Initialize a variable to store the maximum sum found for the current set of rates.
        let maximizedSumForCurrentCase = 0;

        // Iterate through all possible ways to split 'totalValueS' into two positive integers.
        // 'splitPartA' represents the first component, and 'totalValueS - splitPartA' is the second.
        for (let splitPartA = 1; splitPartA < totalValueS; splitPartA++) {
            const componentValues = [splitPartA, totalValueS - splitPartA];
            let currentIterationAccumulator = 0;
            let hadCalculationError = false;

            // Process each of the two components derived from 'totalValueS'.
            for (let componentIdx = 0; componentIdx < 2; componentIdx++) {
                const currentComponent = componentValues[componentIdx];

                // Determine the original price before the first tax rate was applied.
                const preTaxResult = determinePreTaxPrice(currentComponent, firstRate);

                // If no valid pre-tax price could be determined for the current component,
                // mark an error and skip further calculations for this split combination.
                if (!preTaxResult.isValid) {
                    hadCalculationError = true;
                    break;
                }

                // Calculate the final price component after applying the second tax rate.
                const finalAdjustedComponent = calculatePostTaxValue(preTaxResult.value, secondRate);
                currentIterationAccumulator += finalAdjustedComponent;
            }

            // If an error occurred during the calculation for any component in this split,
            // skip to the next split combination.
            if (hadCalculationError) {
                continue;
            }

            // Update the overall maximum sum if the current iteration's sum is greater.
            maximizedSumForCurrentCase = Math.max(maximizedSumForCurrentCase, currentIterationAccumulator);
        }
        // Output the maximum sum found for the current set of input parameters.
        console.log(maximizedSumForCurrentCase);
    }
};

// Invoke the main processing function with input read from standard input.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));