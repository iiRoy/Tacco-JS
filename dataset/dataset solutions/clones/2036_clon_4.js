function solvePuzzle(inputPayload) {
    const dataSegments = inputPayload.split('\n');

    const dimensions = dataSegments[0].split(' ').map(Number);
    const primaryCount = dimensions[0];
    const secondaryCount = dimensions[1];

    const initialPrimarySet = dataSegments[1].split(' ').map(Number);
    const initialSecondarySet = dataSegments[2].split(' ').map(Number);
    const additionalOptions = dataSegments[3].split(' ').map(Number);

    const topPrimaryValues = initialPrimarySet.sort((valA, valB) => valB - valA).slice(0, primaryCount);
    const topSecondaryValues = initialSecondarySet.sort((valA, valB) => valB - valA).slice(0, secondaryCount);

    const collectiveElements = [...topPrimaryValues, ...topSecondaryValues, ...additionalOptions];

    const sortedOverall = collectiveElements.sort((valA, valB) => valB - valA);

    let finalAccumulation = 0;
    const requiredSelections = primaryCount + secondaryCount;

    for (let currentPointer = 0; currentPointer < requiredSelections; currentPointer++) {
        if (currentPointer < sortedOverall.length) {
            finalAccumulation += sortedOverall[currentPointer];
        }
    }
    return finalAccumulation;
}
console.log(solvePuzzle(require("fs").readFileSync("/dev/stdin", "utf8")));