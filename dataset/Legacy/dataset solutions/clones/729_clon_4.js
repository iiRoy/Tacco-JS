const parseInputLine = (inputString) => inputString.split(" ").map(Number);

const deriveUntaxedValue = (finalAmount, taxationRateA) => {
    // The original code finds the largest integer 'base' such that
    // base * (100 + taxationRateA) / 100 < finalAmount + 1.
    // This is equivalent to base < (finalAmount + 1) * 100 / (100 + taxationRateA).
    // To accurately get the largest integer strictly less than the right-hand side,
    // we subtract a very small value (epsilon) before flooring.
    return Math.floor((finalAmount + 1) * 100 / (100 + taxationRateA) - 1e-9);
};

const calculatePostTaxAmount = (baseAmount, taxationRateB) => {
    // This directly implements Math.floor(base * (100 + taxationRateB) / 100).
    // The original code's conditional `if(c + 1 == b * (100 + y) / 100) c++;`
    // is omitted as it represents an impossible condition due to Math.floor behavior,
    // and thus would never alter the value.
    return Math.floor(baseAmount * (100 + taxationRateB) / 100);
};

const checkValidityOfTaxation = (baseAmount, finalAmount, taxationRateA) => {
    // This function checks if the `finalAmount` can be perfectly derived
    // by applying `taxationRateA` to the `baseAmount` using floor rounding.
    // This replicates the `flag` logic: `flag` was true if `b * (100 + x) / 100 < a[j]`,
    // which implies `floor(b * (100 + x) / 100) < a[j]`.
    // So, if `floor(b * (100 + x) / 100) !== a[j]`, the scenario becomes invalid.
    return Math.floor(baseAmount * (100 + taxationRateA) / 100) === finalAmount;
};

const processSingleCase = (factorX, factorY, totalSum) => {
    let greatestResult = 0;

    // Iterate through possible splits for 'totalSum' using a functional approach.
    // 'p1' represents the first part (original 'l' in the original code), from 1 to totalSum - 1.
    Array.from({ length: totalSum - 1 }, (_, idx) => idx + 1)
        .forEach(p1 => {
            const p2 = totalSum - p1; // The second part

            let currentCombinedValue = 0;
            let caseInvalidated = false;

            // Process both parts (p1 and p2) sequentially
            [p1, p2].forEach(segment => {
                if (caseInvalidated) return; // Skip if a segment already invalidated the case

                const derivedBase = deriveUntaxedValue(segment, factorX);
                
                if (!checkValidityOfTaxation(derivedBase, segment, factorX)) {
                    caseInvalidated = true; // Mark case as invalid
                    return;
                }
                
                const taxedSegmentValue = calculatePostTaxAmount(derivedBase, factorY);
                currentCombinedValue += taxedSegmentValue;
            });

            if (!caseInvalidated) {
                greatestResult = Math.max(greatestResult, currentCombinedValue);
            }
        });
    return greatestResult;
};

const manageInputAndOutput = (rawContent) => {
    const contentLines = rawContent.trim().split("\n");
    const outcomes = [];
    let currentLineIndex = 0;

    while (true) {
        const numericValues = parseInputLine(contentLines[currentLineIndex++]);
        const [valX, valY, valS] = numericValues;

        if (valX === 0 && valY === 0 && valS === 0) {
            break; // Exit condition for the input stream
        }
        outcomes.push(processSingleCase(valX, valY, valS));
    }
    return outcomes.join("\n");
};

// Entry point for execution, reading from standard input
const incomingData = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(manageInputAndOutput(incomingData));