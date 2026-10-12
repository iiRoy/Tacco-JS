function calculateMaxSum(rawData) {
    const lineSegments = rawData.split("\n");

    const dimensionValues = lineSegments[0].split(" ");
    const countAlpha = Number(dimensionValues[0]);
    const countBeta = Number(dimensionValues[1]);

    const initialAlphaItems = lineSegments[1].split(" ").map(Number).sort((first, second) => second - first).slice(0, countAlpha);
    const initialBetaItems = lineSegments[2].split(" ").map(Number).sort((first, second) => second - first).slice(0, countBeta);
    const supplementaryItems = lineSegments[3].split(" ").map(Number);

    const allCandidateValues = [...initialAlphaItems, ...initialBetaItems, ...supplementaryItems];

    const orderedCandidateValues = allCandidateValues.sort((first, second) => second - first);

    const finalChosenElements = orderedCandidateValues.slice(0, countAlpha + countBeta);

    const finalAccumulatedSum = finalChosenElements.reduce((currentTotal, element) => currentTotal + element, 0);

    console.log(finalAccumulatedSum);
}

calculateMaxSum(require("fs").readFileSync("/dev/stdin", "utf8"));
