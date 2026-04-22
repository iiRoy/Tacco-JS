function ProcessGiftChoices(incomingRawData) {
    const processedLines = incomingRawData.trim().split("\n");

    const [alphaSize, betaSize, gammaSize, desiredCount] = processedLines[0].split(/\s/).map(Number);

    const alphaElements = processedLines[1].split(/\s/).map(Number);
    const betaElements = processedLines[2].split(/\s/).map(Number);
    const gammaElements = processedLines[3].split(/\s/).map(Number);

    const sortedAlpha = Array.from(alphaElements).sort((valA, valB) => valB - valA);
    const sortedBeta = Array.from(betaElements).sort((valA, valB) => valB - valA);
    const sortedGamma = Array.from(gammaElements).sort((valA, valB) => valB - valA);

    const pairwiseSumsAB = sortedAlpha.slice(0, alphaSize).flatMap(
        (elementAlpha) => sortedBeta.slice(0, betaSize).map(
            (elementBeta) => elementAlpha + elementBeta
        )
    );

    pairwiseSumsAB.sort((sumOne, sumTwo) => sumTwo - sumOne);

    const effectiveIntermediateLimit = Math.min(desiredCount, pairwiseSumsAB.length);

    const ultimateSums = pairwiseSumsAB.slice(0, effectiveIntermediateLimit).flatMap(
        (sumABValue, sumABIndex) => {
            return sortedGamma.slice(0, gammaSize)
                .filter((_, elementGammaIndex) => {
                    return (sumABIndex * elementGammaIndex <= effectiveIntermediateLimit);
                })
                .map(elementGamma => sumABValue + elementGamma);
        }
    );

    ultimateSums.sort((sumOne, sumTwo) => sumTwo - sumOne);

    ultimateSums.slice(0, desiredCount).forEach(
        (finalSum) => console.log(finalSum)
    );
}

ProcessGiftChoices(require("fs").readFileSync("/dev/stdin", "utf8"));