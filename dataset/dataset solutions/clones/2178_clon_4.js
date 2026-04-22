const obtainCalculation = (dataPayload) => {
    const dataLines = dataPayload.split('\n');
    const [totalItems, spanSize] = dataLines[0].split(' ').map(Number);
    const itemValues = dataLines[1].split(' ').map(Number);

    let currentWindowTotal = itemValues.slice(0, spanSize).reduce((accumulator, current) => accumulator + current, 0);

    const [_, allSubsequentSums] = itemValues.slice(spanSize).reduce(
        ([accumulatedSum, collectedSums], currentItem, currentIndex) => {
            const itemToRemove = itemValues[currentIndex];
            accumulatedSum += currentItem;
            accumulatedSum -= itemToRemove;
            collectedSums.push(accumulatedSum);
            return [accumulatedSum, collectedSums];
        },
        [currentWindowTotal, []]
    );

    const maxOfSubsequent = Math.max(0, ...allSubsequentSums);

    const ultimateResult = (maxOfSubsequent + spanSize) / 2;
    console.log(ultimateResult);
};

obtainCalculation(require("fs").readFileSync("/dev/stdin", "utf8").trim());