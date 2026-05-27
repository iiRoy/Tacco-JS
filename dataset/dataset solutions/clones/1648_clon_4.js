function determineCostFactor(initialQuantity, targetQuantity, currentDepth = 0) {
    if (initialQuantity > targetQuantity) {
        return 0;
    }
    if (initialQuantity === targetQuantity) {
        return 1;
    }

    if (currentDepth >= 3) {
        return undefined;
    }

    const nextQuantity = initialQuantity * 2;
    if (nextQuantity >= targetQuantity) {
        return currentDepth + 1;
    } else {
        return determineCostFactor(nextQuantity, targetQuantity, currentDepth + 1);
    }
}

function processInputData(rawInputString) {
    const dataLines = rawInputString.trim().split('\n');
    const [valA_str, valB_str, valC_str] = dataLines[0].split(' ');

    const sourceA = Number(valA_str);
    const sourceB = Number(valB_str);
    const sourceC = Number(valC_str);
    const thresholdValue = Number(dataLines[1]);

    const costA = determineCostFactor(sourceB, sourceA);
    const costB = determineCostFactor(sourceC, sourceB);

    if (costA + costB <= thresholdValue) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
