function processInputData(rawData) {
    const inputParts = rawData.split(" ");

    const customerCount = parseInt(inputParts[0], 10);
    const batchCapacity = parseInt(inputParts[1], 10);
    const timePerUnitBatch = parseInt(inputParts[2], 10);

    const rawBatchCalculation = customerCount / batchCapacity;
    const requiredBatches = Math.ceil(rawBatchCalculation);
    const finalTimeResult = requiredBatches * timePerUnitBatch;

    console.log(finalTimeResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
