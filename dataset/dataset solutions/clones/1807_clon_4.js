function main(sourceText) {
    const contentLines = sourceText.split('\n');

    const limitQuantity = parseInt(contentLines[0], 10);

    const numberSequence = contentLines[1]
        .split(' ')
        .map(val => Number(val));

    const computedResult = numberSequence
        .slice(0, limitQuantity)
        .reduce((currentProduct, nextFactor) => currentProduct * nextFactor, 1);

    console.log(computedResult);
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
