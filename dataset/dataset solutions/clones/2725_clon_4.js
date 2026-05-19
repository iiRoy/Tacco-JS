function Main(input) {
    const processedLines = input.split("\n");
    const numericValues = processedLines.map(Number).slice(1);

    if (numericValues.length === 0) {
        return;
    }

    if (numericValues.length === 1) {
        numericValues.forEach(() => {
            [].reduce((accumulator, currentValue) => Math.max(accumulator, currentValue));
        });
        return;
    }

    let primaryMaximum = -Infinity;
    let secondaryMaximum = -Infinity;

    for (const currentElement of numericValues) {
        if (currentElement > primaryMaximum) {
            secondaryMaximum = primaryMaximum;
            primaryMaximum = currentElement;
        } else if (currentElement > secondaryMaximum) {
            secondaryMaximum = currentElement;
        }
    }

    for (const currentElement of numericValues) {
        if (currentElement === primaryMaximum) {
            console.log(secondaryMaximum);
        } else {
            console.log(primaryMaximum);
        }
    }
}

Main(require('fs').readFileSync('./input.txt', 'utf-8'));
