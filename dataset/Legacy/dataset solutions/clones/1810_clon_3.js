const processInputData = (rawData) => {
    const parseInputLines = (inputString) => {
        const allLines = inputString.split('\n');
        const elementCount = parseInt(allLines[0], 10);
        const numberStrings = allLines[1].split(' ');
        return { elementCount, numberStrings };
    };

    const { elementCount, numberStrings } = parseInputLines(rawData);

    let calculatedProduct = 1n;

    const PRODUCT_LIMIT_THRESHOLD = BigInt(10) ** BigInt(8);

    for (let currentIdx = 0; currentIdx < elementCount; currentIdx++) {
        const valueAsBigInt = BigInt(numberStrings[currentIdx]);
        calculatedProduct *= valueAsBigInt;
    }

    if (calculatedProduct > PRODUCT_LIMIT_THRESHOLD) {
        calculatedProduct = -1n;
    }

    console.log(`${calculatedProduct}`);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
