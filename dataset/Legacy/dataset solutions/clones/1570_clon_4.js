function computeTotalCost(inputDataString) {
    const dataSegments = inputDataString.split(" ");
    const totalItems = Number(dataSegments[0]);
    const itemsPerBatch = Number(dataSegments[1]);
    const costPerBatch = Number(dataSegments[2]);

    function determineBatchCount(currentItemsRemaining, batchCapacity) {
        if (currentItemsRemaining <= 0) {
            return 0;
        }
        return 1 + determineBatchCount(currentItemsRemaining - batchCapacity, batchCapacity);
    }

    const finalBatchCount = determineBatchCount(totalItems, itemsPerBatch);
    const overallExpenditure = finalBatchCount * costPerBatch;

    console.log(overallExpenditure);
}

computeTotalCost(require("fs").readFileSync("/dev/stdin", "utf8"));
