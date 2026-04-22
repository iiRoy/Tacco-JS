let totalBuffer = '';
process.stdin.on('data', (piece) => {
    totalBuffer += piece;
});

const calculateProduct = (valA, valB) => {
    let finalProduct = 0;
    let absValA = Math.abs(valA);
    let absValB = Math.abs(valB);

    for (let counter = 0; counter < absValB; counter++) {
        finalProduct += absValA;
    }

    if ((valA < 0 && valB > 0) || (valA > 0 && valB < 0)) {
        return -finalProduct;
    }
    return finalProduct;
};

const divideByTwo = (numericValue) => {
    return numericValue * 0.5;
};

process.stdin.on('end', () => {
    let currentSegment = '';
    let numericCollection = [];
    for (let symbol of totalBuffer) {
        if (symbol === ' ' || symbol === '\n' || symbol === '\r') {
            if (currentSegment.length > 0) {
                numericCollection.push(Number(currentSegment));
                currentSegment = '';
            }
        } else {
            currentSegment += symbol;
        }
    }
    if (currentSegment.length > 0) {
        numericCollection.push(Number(currentSegment));
    }

    let calculatedProduct = calculateProduct(numericCollection[0], numericCollection[1]);
    let finalResult = divideByTwo(calculatedProduct);

    console.log(finalResult);
});