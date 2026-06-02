function computeSumOfFirstThreePowers(baseNumber) {
    const baseSquared = baseNumber * baseNumber;
    const baseCubed = baseNumber * baseSquared;
    return baseNumber + baseSquared + baseCubed;
}

function processInputData(rawDataString) {
    const inputLines = rawDataString.split("\n");
    
    const firstLineContent = inputLines[0];
    const parsedNumericValue = parseInt(firstLineContent, 10);
    
    const finalComputedValue = computeSumOfFirstThreePowers(parsedNumericValue);
    
    console.log(finalComputedValue);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
