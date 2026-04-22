const calculateAndOutput = (dataStream) => {
    const [lineOne, lineTwo] = dataStream.split('\n');
    const quantity = Number(lineOne);
    const numericStrings = lineTwo.split(' ');

    const productRecursively = (elements, currentPosition, currentProduct) => {
        if (currentPosition >= quantity) {
            return currentProduct;
        }
        const nextFactor = BigInt(elements[currentPosition]);
        return productRecursively(elements, currentPosition + 1, currentProduct * nextFactor);
    };

    const startingProduct = 1n;
    const computedOverallProduct = productRecursively(numericStrings, 0, startingProduct);

    const thresholdConstant = 100000000n;

    const determineFinalValue = (calculatedValue) => {
        return calculatedValue > thresholdConstant ? -1n : calculatedValue;
    };

    const finalDisplayValue = determineFinalValue(computedOverallProduct);

    console.log(finalDisplayValue.toString());
};

calculateAndOutput(require('node:fs').readFileSync('/dev/stdin', 'utf-8'));