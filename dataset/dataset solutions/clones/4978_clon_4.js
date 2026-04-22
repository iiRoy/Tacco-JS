function processGridData(rawInputLines) {
    const dimensionsAndCount = rawInputLines[0].split(" ").map(Number);
    const totalGridRows = dimensionsAndCount[0];
    const totalGridCols = dimensionsAndCount[1];
    const numberOfPoints = dimensionsAndCount[2];

    const effectiveHeight = totalGridRows - 2;
    const effectiveWidth = totalGridCols - 2;

    const coordinatePairs = rawInputLines.slice(1, numberOfPoints + 1).map(line => line.split(" ").map(Number));

    const squarePointMap = new Map();

    for (const currentPoint of coordinatePairs) {
        const pointRow = currentPoint[0];
        const pointCol = currentPoint[1];

        for (let tlRowOffset = -2; tlRowOffset <= 0; tlRowOffset++) {
            const currentTlRow = pointRow + tlRowOffset;
            if (currentTlRow >= 1 && currentTlRow <= effectiveHeight) {
                for (let tlColOffset = -2; tlColOffset <= 0; tlColOffset++) {
                    const currentTlCol = pointCol + tlColOffset;
                    if (currentTlCol >= 1 && currentTlCol <= effectiveWidth) {
                        const squareIdentifier = `${currentTlRow}_${currentTlCol}`;
                        squarePointMap.set(squareIdentifier, (squarePointMap.get(squareIdentifier) || 0) + 1);
                    }
                }
            }
        }
    }

    const finalOccurrenceCounts = new Array(10).fill(0);

    for (const pointCountInSquare of squarePointMap.values()) {
        if (pointCountInSquare <= 9) {
            finalOccurrenceCounts[pointCountInSquare]++;
        }
    }

    let zeroCountForDisplay = effectiveHeight * effectiveWidth;
    let largeNumberCarry = 0;

    if (zeroCountForDisplay > 9e15) {
        zeroCountForDisplay = (effectiveHeight % 100000 * effectiveWidth);
        largeNumberCarry = Math.floor(zeroCountForDisplay / 100000);
        zeroCountForDisplay %= 100000;
    }

    for (let count = 1; count <= 9; count++) {
        zeroCountForDisplay -= finalOccurrenceCounts[count];
    }

    if (largeNumberCarry > 0) {
        largeNumberCarry += Math.floor(effectiveHeight / 100000) * effectiveWidth;
        
        while (zeroCountForDisplay < 0) {
            largeNumberCarry--;
            zeroCountForDisplay += 100000;
        }
        const formattedZeroCount = String(zeroCountForDisplay).padStart(5, '0');
        finalOccurrenceCounts[0] = `${largeNumberCarry}${formattedZeroCount}`;
    } else {
        finalOccurrenceCounts[0] = zeroCountForDisplay;
    }

    const outputLines = finalOccurrenceCounts.map(val => String(val));
    console.log(outputLines.join("\n"));
}

const inputData = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");
processGridData(inputData);