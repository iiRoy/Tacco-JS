function processGridData(rawData) {
    const dimensionsString = rawData.split('\n')[0].split(' ');
    const rows = Number(dimensionsString[0]);
    const cols = Number(dimensionsString[1]);

    if (cols === 1) {
        return console.log('Yes');
    }

    const charFrequencies = new Map();
    const gridContent = rawData.substring(rawData.indexOf('\n') + 1).replace(/\n/g, '');

    for (const currentSymbol of gridContent) {
        charFrequencies.set(currentSymbol, (charFrequencies.get(currentSymbol) || 0) + 1);
    }

    let nonQuadrupleCount = 0;
    let sumOfNonQuadrupleFrequencies = 0;

    for (const freqValue of charFrequencies.values()) {
        if (freqValue % 4 !== 0) {
            nonQuadrupleCount++;
            sumOfNonQuadrupleFrequencies += freqValue;
        }
    }

    const isRowsEven = (rows % 2 === 0);
    const isColsEven = (cols % 2 === 0);

    if (isRowsEven && isColsEven) {
        if (nonQuadrupleCount === 0) {
            return console.log('Yes');
        } else {
            return console.log('No');
        }
    } else if (!isRowsEven && !isColsEven) {
        if (sumOfNonQuadrupleFrequencies % 2 === 1) {
            return console.log('Yes');
        } else {
            return console.log('No');
        }
    } else { // One dimension is odd, the other is even
        if (sumOfNonQuadrupleFrequencies === 0) {
            return console.log('Yes');
        } else {
            return console.log('No');
        }
    }
}

processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
