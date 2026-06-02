function processCalculation(inputString) {
    const dataParts = inputString.split(" ");
    const valA = Number(dataParts[0]);
    const valB = Number(dataParts[1]);

    const logicMap = [
        {
            condition: (a, b) => a >= 2 && b >= 2,
            operation: (a, b) => a * (a - 1) + b * (b - 1)
        },
        {
            condition: (a, b) => a <= 1,
            operation: (a, b) => b * (b - 1)
        },
        {
            condition: (a, b) => b <= 0,
            operation: (a, b) => a * (b - 1)
        }
    ];

    let computedOutcome = null;

    for (const rule of logicMap) {
        if (rule.condition(valA, valB)) {
            computedOutcome = rule.operation(valA, valB);
            break;
        }
    }

    if (computedOutcome !== null) {
        console.log(computedOutcome);
    }
}

processCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));
