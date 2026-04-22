const calculateGreatestProduct = (sourceData) => {
    const numericSegments = sourceData.trim().split(/\s+/).map(entry => +entry);
    
    const factorsToCombine = [
        [numericSegments[0], numericSegments[2]],
        [numericSegments[0], numericSegments[3]],
        [numericSegments[1], numericSegments[2]],
        [numericSegments[1], numericSegments[3]]
    ];
    
    const ultimateResult = factorsToCombine.reduce((currentPeak, factorSet) => {
        const computedValue = factorSet[0] * factorSet[1];
        return computedValue > currentPeak ? computedValue : currentPeak;
    }, Number.MIN_SAFE_INTEGER); // Using MIN_SAFE_INTEGER for robustness with negative products
    
    console.log(ultimateResult);
};

calculateGreatestProduct(require("fs").readFileSync("/dev/stdin", "utf8"));