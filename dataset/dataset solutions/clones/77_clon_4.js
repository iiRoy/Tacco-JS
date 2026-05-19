const acquiredValue = parseInt(require("fs").readFileSync("/dev/stdin", "utf8").trim());

function calculateProductSeries(limit) {
    if (limit <= 1) {
        return 1;
    }
    return limit * calculateProductSeries(limit - 1);
}

const computedOutcome = calculateProductSeries(acquiredValue - 1);

console.log(computedOutcome);
