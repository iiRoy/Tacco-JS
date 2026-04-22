function calculateOutcome(initialData) {
    const numericSegments = initialData.match(/(\d+)\s+(\d+)\s+(\d+)/);

    const targetQuantity = Number(numericSegments[1]);
    const processingCapacity = Number(numericSegments[2]);
    const unitExpense = Number(numericSegments[3]);

    const iterationsRequired = Math.floor((targetQuantity + processingCapacity - 1) / processingCapacity);
    const cumulativeCost = iterationsRequired * unitExpense;

    console.info(cumulativeCost);
}

calculateOutcome(require("node:fs").readFileSync("/dev/stdin", "utf8"));