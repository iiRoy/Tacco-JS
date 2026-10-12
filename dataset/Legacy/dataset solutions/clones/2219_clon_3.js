function processPriceData(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const numberOfPricesString = inputLines[0];
    const priceValuesLine = inputLines[1];
    
    const priceStringArray = priceValuesLine.split(" ");
  
    let eligiblePriceCount = 0;
    const INITIAL_MINIMUM_VALUE = Number.MAX_SAFE_INTEGER;
    let currentMinimumPrice = INITIAL_MINIMUM_VALUE;

    // The loop iteration count is derived from the first line of input.
    // JavaScript implicitly converts the string to a number for the loop condition.
    // We make this conversion explicit for clarity, preserving behavior.
    const totalPricesToProcess = Number(numberOfPricesString); 

    for (let priceIndex = 0; priceIndex < totalPricesToProcess; priceIndex++) {
        const currentPriceCandidate = priceStringArray[priceIndex]; // This remains a string

        // The original code had two sequential 'if' statements with identical conditions:
        // 1. if (Pi <= PjMin) { count++; }
        // 2. if (PjMin >= Pi) { PjMin = Pi; }
        // Since 'PjMin' is not modified between these two checks, and 'A <= B' is
        // logically equivalent to 'B >= A', both actions (incrementing count and
        // updating PjMin) occur under the exact same condition.
        // Combining them into a single 'if' block preserves this precise logic,
        // including JavaScript's implicit type coercion behavior (e.g., Number -> String -> String
        // for 'currentMinimumPrice' and string comparisons in subsequent iterations).
        if (currentPriceCandidate <= currentMinimumPrice) {
            eligiblePriceCount++;
            currentMinimumPrice = currentPriceCandidate; 
        }
    }
    
    console.log(eligiblePriceCount);
}

processPriceData(require("fs").readFileSync("/dev/stdin", "utf8"));
