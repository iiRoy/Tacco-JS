function exponentiation(baseVal, expVal) {
    const actualExp = Math.trunc(expVal);

    if (actualExp === 0) {
        return 1;
    }
    if (actualExp < 0) {
        return 1 / exponentiation(baseVal, -actualExp);
    }
    return baseVal * exponentiation(baseVal, actualExp - 1);
}

function processingRoutine(sourceText) {
    const numberSet = sourceText.split(' ').map(Number);

    const firstDatum = numberSet[0];
    const secondDatum = numberSet[1];

    const intermediateProduct = exponentiation(100, firstDatum);

    const finalProduct = intermediateProduct * Math.trunc(secondDatum);

    console.log(finalProduct);
}

let dataChunks = '';
process.stdin.on('data', inputReceiver => {
    dataChunks += inputReceiver;
});
process.stdin.on('end', () => {
    processingRoutine(dataChunks.trim());
});