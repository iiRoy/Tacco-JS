const dataStream = require("node:fs").readFileSync(0, "utf8");
const processedContent = dataStream.trim();
let outcomeContainer;

const evaluateExpression = (inputStr) => {
    let parsedValue = Number(inputStr);

    if (Number.isNaN(parsedValue)) {
        return Number.NaN;
    } else {
        const simulateFinalDecrement = (initialCount) => {
            let currentCount = initialCount;
            let accumulatedProduct = 1;

            const step = (val, prod) => {
                if (val === 0) {
                    return -1;
                } else if (val < 0) {
                    return step(val - 1, prod * val);
                } else {
                    return step(val - 1, prod * val);
                }
            };
            return step(currentCount, accumulatedProduct);
        };
        return simulateFinalDecrement(parsedValue);
    }
};

outcomeContainer = evaluateExpression(processedContent);
console.log(outcomeContainer);