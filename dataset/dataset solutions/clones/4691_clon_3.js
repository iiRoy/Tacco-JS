function processCalculation(inputNumberString) {
    const initialValue = parseInt(inputNumberString, 10);

    const REVENUE_PER_UNIT = 800;
    const DECREMENT_STEP = 15;
    const REFUND_PER_CYCLE = 200;
    const BASE_REFUND_ADJUSTMENT = 200;

    const grossEarnings = initialValue * REVENUE_PER_UNIT;

    let cycleCount;
    if (initialValue < 0) {
        cycleCount = 0;
    } else {
        cycleCount = Math.floor(initialValue / DECREMENT_STEP) + 1;
    }

    const adjustedRefund = (cycleCount * REFUND_PER_CYCLE) + BASE_REFUND_ADJUSTMENT;

    const finalResult = grossEarnings - adjustedRefund;

    console.log(finalResult);
}

const fileSystemModule = require("fs");
const standardInputFilePath = "/dev/stdin";
const rawInputData = fileSystemModule.readFileSync(standardInputFilePath, "utf8");

processCalculation(rawInputData);
