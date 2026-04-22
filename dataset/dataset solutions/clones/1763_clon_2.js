const coordinateIdGenerator = (rowIndex, columnIndex) => `_R${rowIndex}_C${columnIndex}_`;

const resultCache = new Map();

const calculateGridPoint = (firstRow, firstCol, lastRow, lastCol) => {
    const currentIdentifier = coordinateIdGenerator(lastRow, lastCol);
    if (resultCache.has(currentIdentifier)) {
        return resultCache.get(currentIdentifier);
    }

    let finalResult;

    if (firstRow === lastRow) {
        finalResult = firstRow ** (lastCol - firstCol);
    } else if (firstCol === lastCol) {
        finalResult = firstCol ** (lastRow - firstRow);
    } else {
        finalResult = calculateGridPoint(firstRow, firstCol, lastRow - 1n, lastCol) * lastCol +
                      calculateGridPoint(firstRow, firstCol, lastRow, lastCol - 1n) * lastRow -
                      calculateGridPoint(firstRow, firstCol, lastRow - 1n, lastCol - 1n) * (lastRow - 1n) * (lastCol - 1n);
    }

    resultCache.set(coordinateIdGenerator(lastRow, lastCol), finalResult);
    return finalResult;
};

const MODULO_PRIME = 998244353n;

const processInputAndDisplay = (rawData) => {
    const linesOfText = rawData.split("\n");
    const [startR, startC, endR, endC] = linesOfText[0].split(" ").map(numericString => BigInt(numericString));
    console.log(Number(calculateGridPoint(startR, startC, endR, endC) % MODULO_PRIME));
};

processInputAndDisplay(require('node:fs').readFileSync('/dev/stdin', 'utf-8'));