function processInput(dataString) {
    const [alphaUnits, betaUnits] = dataString.split(' ').map(Number);

    // Determine the maximum quantity of 'beta' units that can be allocated to form 'alpha'-based pairs.
    // Each 'alpha' unit requires 2 'beta' units.
    // So, 'alphaUnits' can potentially utilize 'alphaUnits * 2' 'beta' units.
    // This utilization is, however, capped by the total 'betaUnits' actually available.
    const betaAllocatedForAlphaPairs = Math.min(alphaUnits * 2, betaUnits);

    // Calculate the number of pairs that can be formed using 'alpha' units.
    // Since each such pair consumes 2 'beta' units, we divide the allocated 'beta' by 2.
    const alphaComponentPairs = Math.floor(betaAllocatedForAlphaPairs / 2);

    // Calculate the 'beta' units that remain after forming all possible 'alpha'-based pairs.
    const remainingBetaComponent = betaUnits - betaAllocatedForAlphaPairs;

    // The leftover 'beta' units can only be used to form 'beta'-only pairs.
    // Each 'beta'-only pair requires 4 'beta' units.
    const betaOnlyComponentPairs = Math.floor(remainingBetaComponent / 4);

    // The final count of all formed pairs is the sum of 'alpha'-based pairs and 'beta'-only pairs.
    const finalPairCount = alphaComponentPairs + betaOnlyComponentPairs;

    console.log(finalPairCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
