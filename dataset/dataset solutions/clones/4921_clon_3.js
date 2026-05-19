function processInputData(rawData) {
    let currentTallyT = 0;
    let currentTallyA = 0;

    const lines = rawData.split("\n");
    const numEntries = Number(lines[0]);

    const applyRatioUpdate = (targetT, targetA) => {
        if (currentTallyT <= targetT && currentTallyA <= targetA) {
            currentTallyT = targetT;
            currentTallyA = targetA;
        } else {
            const ratioForT = currentTallyT / targetT;
            const ratioForA = currentTallyA / targetA;
            const requiredScalingFactor = Math.ceil(Math.max(ratioForT, ratioForA));

            currentTallyT = targetT * requiredScalingFactor;
            currentTallyA = targetA * requiredScalingFactor;
        }
    };

    for (let idx = 1; idx <= numEntries; idx++) {
        const entryParts = lines[idx].split(" ");
        const currentT = Number(entryParts[0]);
        const currentA = Number(entryParts[1]);

        applyRatioUpdate(currentT, currentA);
    }

    const finalResultSum = currentTallyT + currentTallyA;
    console.log(finalResultSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
