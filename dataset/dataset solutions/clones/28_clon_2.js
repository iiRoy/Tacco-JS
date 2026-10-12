function obtainProductSequence(limit) {
    let accumulatedProduct = 1;

    for (
        let currentMultiplier = 2;
        currentMultiplier <= limit;
        currentMultiplier++
    ) {
        accumulatedProduct *= currentMultiplier;
    }

    return accumulatedProduct;
}