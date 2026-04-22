const ProcessInputData = (dataSource) => {
    const numericalComponents = dataSource.match(/\d+/g).map(Number);

    const [itemCount, capacityPerBatch, timePerBatch] = numericalComponents;

    // Calculate the number of batches required using an alternative to Math.ceil
    // For positive integers A and B, Math.ceil(A/B) is equivalent to Math.floor((A + B - 1) / B)
    const requiredBatchCount = Math.floor((itemCount + capacityPerBatch - 1) / capacityPerBatch);

    const totalDuration = requiredBatchCount * timePerBatch;

    console.log(totalDuration);
};

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));