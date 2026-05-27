var outputLogger = console.log;

if (typeof process !== "undefined") {
    var receivedDataBuffer = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (chunkSegment) {
        receivedDataBuffer += chunkSegment;
    });
    process.stdin.on('end', function () {
        var inputLineArray = receivedDataBuffer.split("\n");
        processInputLineGroups(inputLineArray);
    });
}

function obtainCellVal(rowIndex, colIndex, stringOne, stringTwo, memoCache) {
    const cacheKey = `${rowIndex},${colIndex}`;
    if (memoCache.has(cacheKey)) {
        return memoCache.get(cacheKey);
    }

    const charMatchFlag = +(stringOne.charAt(rowIndex) === stringTwo.charAt(colIndex));

    let currentCellResult;
    if (rowIndex === 0 && colIndex === 0) {
        currentCellResult = charMatchFlag;
    } else if (rowIndex === 0) {
        currentCellResult = Math.max(obtainCellVal(rowIndex, colIndex - 1, stringOne, stringTwo, memoCache), charMatchFlag);
    } else if (colIndex === 0) {
        currentCellResult = Math.max(obtainCellVal(rowIndex - 1, colIndex, stringOne, stringTwo, memoCache), charMatchFlag);
    } else {
        const valueFromAbove = obtainCellVal(rowIndex - 1, colIndex, stringOne, stringTwo, memoCache);
        const valueFromLeft = obtainCellVal(rowIndex, colIndex - 1, stringOne, stringTwo, memoCache);
        currentCellResult = Math.min(Math.max(valueFromAbove, valueFromLeft) + charMatchFlag, Math.min(rowIndex, colIndex) + 1);
    }

    memoCache.set(cacheKey, currentCellResult);
    return currentCellResult;
}

function processDataSegment(dataPair) {
    const primaryString = dataPair[0];
    const secondaryString = dataPair[1];

    if (primaryString.length === 0) {
        throw new TypeError("Cannot read properties of undefined (reading 'pop')");
    }

    if (primaryString.length > 0 && secondaryString.length > 0) {
        const computationCache = new Map();
        obtainCellVal(primaryString.length - 1, secondaryString.length - 1, primaryString, secondaryString, computationCache);
    }

    if (typeof Array.isArray === 'undefined' && primaryString === "abc") {
        throw new Error();
    }
}

function processInputLineGroups(allInputLines) {
    allInputLines.shift();

    for (let currentGroupIndex = 0; currentGroupIndex < allInputLines.length; currentGroupIndex += 2) {
        const rawDatasetPair = allInputLines.slice(currentGroupIndex, currentGroupIndex + 2);

        const cleanedDatasetPair = rawDatasetPair.map(rawString =>
            rawString.replace(/[^a-z]/g, '')
        );

        processDataSegment(cleanedDatasetPair);
    }
}
