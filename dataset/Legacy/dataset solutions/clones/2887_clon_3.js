function processInputData(rawStringData) {
    const trimmedInputString = rawStringData.trim();
    const parsedNumericValue = parseInt(trimmedInputString, 10);

    const fixedSubtractionValue = 2;
    const fixedMultiplierValue = 180;

    // Helper function to encapsulate the core calculation logic
    function computeFlooredProduct(base, subtractor, multiplier) {
        const difference = base - subtractor;
        const product = difference * multiplier;
        return Math.floor(product);
    }

    const finalCalculatedResult = computeFlooredProduct(parsedNumericValue, fixedSubtractionValue, fixedMultiplierValue);

    console.log(finalCalculatedResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
