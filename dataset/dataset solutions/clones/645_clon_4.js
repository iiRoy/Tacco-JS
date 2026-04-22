class OptimalResourceAllocator {
    #initialQuantity;
    #scenarioOneBatchSize;
    #scenarioOneBatchCost;
    #scenarioTwoBatchSize;
    #scenarioTwoBatchCost;

    constructor(
        quantity,
        batchSizeA,
        costA,
        batchSizeB,
        costB
    ) {
        this.#initialQuantity = quantity;
        this.#scenarioOneBatchSize = batchSizeA;
        this.#scenarioOneBatchCost = costA;
        this.#scenarioTwoBatchSize = batchSizeB;
        this.#scenarioTwoBatchCost = costB;
    }

    #calculateNeededBatches(totalAmount, singleBatchSize) {
        return Math.ceil(totalAmount / singleBatchSize);
    }

    #determineTotalExpense(requiredBatches, unitPrice) {
        return requiredBatches * unitPrice;
    }

    evaluateMinimumExpenditure() {
        const batchesForOptionA = this.#calculateNeededBatches(
            this.#initialQuantity,
            this.#scenarioOneBatchSize
        );
        const expenseOptionA = this.#determineTotalExpense(
            batchesForOptionA,
            this.#scenarioOneBatchCost
        );

        const batchesForOptionB = this.#calculateNeededBatches(
            this.#initialQuantity,
            this.#scenarioTwoBatchSize
        );
        const expenseOptionB = this.#determineTotalExpense(
            batchesForOptionB,
            this.#scenarioTwoBatchCost
        );

        return Math.min(expenseOptionA, expenseOptionB);
    }
}

// Entry point for execution in a Node.js environment
const programArguments = process.argv.slice(2);

if (programArguments.length === 5) {
    const numericInputs = programArguments.map(arg => parseInt(arg, 10));

    const decisionEngine = new OptimalResourceAllocator(
        numericInputs[0],
        numericInputs[1],
        numericInputs[2],
        numericInputs[3],
        numericInputs[4]
    );

    console.log(decisionEngine.evaluateMinimumExpenditure());
}