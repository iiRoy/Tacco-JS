function processInput(rawData) {
    const parsedValues = rawData.trim().split(" ");
    const valA = Number(parsedValues[0]);
    const valB = Number(parsedValues[1]);
    const valC = Number(parsedValues[2]);

    let finalOutcome = 0;

    let diffAB = valA - valB;
    let diffCE = valC - 1;

    const diffCB = valC - valB;
    const isDiffCBEven = (diffCB % 2 === 0);

    let adjustmentAmount = 0;

    if (isDiffCBEven) {
        const potentialAdjustment = diffCB - 2;
        if (potentialAdjustment >= 0) {
            adjustmentAmount = potentialAdjustment / 2;
        }
    } else {
        const potentialAdjustment = diffCB - 1;
        if (potentialAdjustment >= 0) {
            adjustmentAmount = potentialAdjustment / 2;
        }
    }

    diffAB -= adjustmentAmount;
    diffCE -= adjustmentAmount;

    finalOutcome = Math.min(diffAB, diffCE);

    if (isDiffCBEven) {
        finalOutcome = Math.min(diffCB / 2, finalOutcome);
    }

    console.log(finalOutcome);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
