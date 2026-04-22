function analyzeAccessPoints(sourceMaterial) {
    const allLines = sourceMaterial.trim().split("\n");

    const initialSettings = allLines[0].split(" ").map(Number);
    const maximumPermit = initialSettings[0];
    const numberOfRestrictions = initialSettings[1];

    const restrictionSegments = allLines.slice(1, numberOfRestrictions + 1)
                                      .map(line => line.split(" ").map(Number));

    const initialValidSpan = [1, maximumPermit];

    const finalValidSpan = restrictionSegments.reduce((accumulatedSpan, currentGateLimits) => {
        const currentLowerBound = accumulatedSpan[0];
        const currentUpperBound = accumulatedSpan[1];
        const gateLowerBound = currentGateLimits[0];
        const gateUpperBound = currentGateLimits[1];

        const newLower = Math.max(currentLowerBound, gateLowerBound);
        const newUpper = Math.min(currentUpperBound, gateUpperBound);
        
        return [newLower, newUpper];
    }, initialValidSpan);

    const ultimateLower = finalValidSpan[0];
    const ultimateUpper = finalValidSpan[1];

    const possiblePermits = Math.max(0, ultimateUpper - ultimateLower + 1);
    
    console.log(possiblePermits);
}

analyzeAccessPoints(require("fs").readFileSync("/dev/stdin", "utf8"));