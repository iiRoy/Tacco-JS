const processInput = (sourceText) => {
    const [firstLine, secondLine] = sourceText.trim().split("\n");
    const elementCount = Number(firstLine); // 'n' from original, unused but parsed
    const numericValues = secondLine.split(" ").map(BigInt);

    const OVERFLOW_THRESHOLD = 1000000000000000000n;

    if (numericValues.some(val => val === 0n)) {
        console.log(0);
        return;
    }

    const calculateRecursiveProduct = (idx, currentProduct) => {
        if (currentProduct > OVERFLOW_THRESHOLD) {
            return -1n; // Sentinel for overflow
        }
        if (idx === numericValues.length) {
            return currentProduct; // Base case: all elements processed
        }

        const nextProduct = currentProduct * numericValues[idx];
        return calculateRecursiveProduct(idx + 1, nextProduct);
    };

    const finalProduct = calculateRecursiveProduct(0, 1n);

    if (finalProduct === -1n) {
        console.log(-1);
    } else {
        console.log(finalProduct.toString());
    }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
