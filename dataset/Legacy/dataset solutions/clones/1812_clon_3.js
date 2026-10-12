const calculateProduct = inputStringData => {
    const trimmedContent = inputStringData.trim();
    const lineSegments = trimmedContent.split('\n');

    const elementCount = parseInt(lineSegments[0]); // 'n' is parsed but not used, preserving original behavior
    
    const stringNumbers = lineSegments[1].split(' ');
    const numericValues = stringNumbers.map(strVal => BigInt(strVal));

    const ZERO_BIGINT = 0n;
    const OVERFLOW_LIMIT = BigInt(1000000000000000000);

    if (numericValues.includes(ZERO_BIGINT)) {
        console.log(0);
        return;
    }

    let cumulativeProduct = 1n;
    for (let i = 0; i < numericValues.length; i++) {
        const currentValue = numericValues[i];
        cumulativeProduct = cumulativeProduct * currentValue;

        if (cumulativeProduct > OVERFLOW_LIMIT) {
            console.log(-1);
            return;
        }
    }

    console.log(cumulativeProduct.toString());
};

calculateProduct(require('fs').readFileSync('/dev/stdin', 'utf8'));
