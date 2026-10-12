function processInputAndCalculate(rawData) {
    const RADIX_DECIMAL = 10;
    let lines = rawData.split('\n');

    let numElements = parseInt(lines[0], RADIX_DECIMAL);
    let dataArray = lines[1].split(' ').map(val => parseInt(val, RADIX_DECIMAL));

    let validPairCount = 0;

    for (let outerIndex = 0; outerIndex < numElements; outerIndex++) {
        const currentElement = dataArray[outerIndex];

        let xorSum = currentElement;
        let arithSum = currentElement;

        validPairCount++;

        for (let innerIndex = outerIndex + 1; innerIndex < numElements; innerIndex++) {
            const nextElement = dataArray[innerIndex];

            xorSum = xorSum ^ nextElement;
            arithSum = arithSum + nextElement;

            if (xorSum === arithSum) {
                validPairCount++;
            }
        }
    }
    console.log(validPairCount);
}

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
