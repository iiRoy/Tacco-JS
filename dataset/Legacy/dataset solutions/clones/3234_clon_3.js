function processInputData(rawData) {
    const inputLines = rawData.split("\n");
    const firstLineParts = inputLines[0].split(" ");

    const DECIMAL_RADIX = 10;

    const totalItems = parseInt(firstLineParts[0], DECIMAL_RADIX);
    const firstCount = parseInt(firstLineParts[1], DECIMAL_RADIX);
    const secondCount = parseInt(firstLineParts[2], DECIMAL_RADIX);

    const maxPossibleOverlap = Math.min(firstCount, secondCount);

    let minRequiredOverlap = 0;

    const halfTotalItemsFloored = Math.floor(totalItems / 2);

    if (firstCount !== 0 && secondCount !== 0) {
        const firstExcessAmount = Math.max(0, firstCount - halfTotalItemsFloored);
        const secondExcessAmount = Math.max(0, secondCount - halfTotalItemsFloored);

        minRequiredOverlap = firstExcessAmount + secondExcessAmount;
    }

    console.log('%d %d', maxPossibleOverlap, minRequiredOverlap);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
