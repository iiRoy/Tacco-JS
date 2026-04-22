function determinePriceAdjustment(strData) {
    const valNum = Number.parseFloat(strData.trim());

    let blockCounter = 0;
    let tempValue = valNum;
    while (tempValue >= 15) {
        tempValue -= 15;
        blockCounter++;
    }

    const calculateGrossValue = (v) => 800 * v;
    const calculateRebateUnits = (v) => 200 * v;
    const deriveFinalAmount = (g, r) => g - r;

    const baseCost = calculateGrossValue(valNum);
    const reduction = calculateRebateUnits(blockCounter);

    return deriveFinalAmount(baseCost, reduction);
}

const rawInputContent = require("node:fs").readFileSync(0, "utf8");
console.log(determinePriceAdjustment(rawInputContent));