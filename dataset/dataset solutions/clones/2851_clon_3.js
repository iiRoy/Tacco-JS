function processInputData(rawData) {
    const parseIntegerLine = (lineContent) => lineContent.split(" ").map(Number);

    const lines = rawData.split("\n");
    const initialValue = parseInt(lines[0]);
    const values = parseIntegerLine(lines[1]);
    const costs = parseIntegerLine(lines[2]);

    const itemRates = [
        { rate: values[0] / costs[0], originalIndex: 0 },
        { rate: values[1] / costs[1], originalIndex: 1 },
        { rate: values[2] / costs[2], originalIndex: 2 }
    ];

    itemRates.sort((itemA, itemB) => itemB.rate - itemA.rate);

    const idxHigh = itemRates[0].originalIndex;
    const idxMid = itemRates[1].originalIndex;
    const idxLow = itemRates[2].originalIndex;

    const isConversionEfficient = (index) => values[index] / costs[index] >= 1.0;

    const performForwardConversion = (currentAmount, indicesToProcess, valsArr, cstsArr) => {
        let accumulatedValue = 0;
        let remainingAmount = currentAmount;

        for (const idx of indicesToProcess) {
            const numUnits = Math.floor(remainingAmount / cstsArr[idx]);
            accumulatedValue += numUnits * valsArr[idx];
            remainingAmount %= cstsArr[idx];
        }
        return accumulatedValue + remainingAmount;
    };

    const performBackwardConversion = (currentAmount, indicesToProcess, valsArr, cstsArr) => {
        let accumulatedCost = 0;
        let remainingAmount = currentAmount;

        for (const idx of indicesToProcess) {
            const numUnits = Math.floor(remainingAmount / valsArr[idx]);
            accumulatedCost += numUnits * cstsArr[idx];
            remainingAmount %= valsArr[idx];
        }
        return accumulatedCost + remainingAmount;
    };

    let finalResult;

    const highEfficient = isConversionEfficient(idxHigh);
    const midEfficient = isConversionEfficient(idxMid);
    const lowEfficient = isConversionEfficient(idxLow);

    if (highEfficient) {
        if (midEfficient) {
            if (lowEfficient) {
                finalResult = performForwardConversion(initialValue, [idxHigh, idxMid, idxLow], values, costs);
            } else {
                const intermediateAmount = performBackwardConversion(initialValue, [idxLow], values, costs);
                finalResult = performForwardConversion(intermediateAmount, [idxHigh, idxMid], values, costs);
            }
        } else {
            const intermediateAmount = performBackwardConversion(initialValue, [idxLow, idxMid], values, costs);
            finalResult = performForwardConversion(intermediateAmount, [idxHigh], values, costs);
        }
    } else {
        finalResult = performBackwardConversion(initialValue, [idxLow, idxMid, idxHigh], values, costs);
    }

    console.log(finalResult);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
