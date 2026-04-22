const queryCellPattern = (baseShade, unitSize, xCoordinate, yCoordinate) => {
    const rowUnit = Math.floor(xCoordinate / unitSize);
    const colUnit = Math.floor(yCoordinate / unitSize);

    const matchesPattern = (
        (rowUnit === 0 && colUnit === 0) ||
        (rowUnit === 1 && colUnit === 1) ||
        (rowUnit === 2 && colUnit === 0)
    );

    return matchesPattern ? baseShade : (baseShade === "B" ? "W" : "B");
};

const analyzePointAlignments = (dataLines) => {
    const configInfo = dataLines[0].split(" ").map(Number);
    const pointCount = configInfo[0];
    const unitDimension = configInfo[1];

    const normalizedCoordinates = [];

    for (let currentPointIdx = 1; currentPointIdx <= pointCount; currentPointIdx++) {
        const currentPointData = dataLines[currentPointIdx].split(" ");
        const initialX = Number(currentPointData[0]);
        const initialY = Number(currentPointData[1]);
        const initialShade = currentPointData[2];

        const xBlockIndex = Math.floor(initialX / unitDimension);
        const yBlockIndex = Math.floor(initialY / unitDimension);

        const xRelative = initialX % unitDimension;
        const yRelative = initialY % unitDimension;

        const isXParityOdd = (xBlockIndex % 2 !== 0);
        const isYParityOdd = (yBlockIndex % 2 !== 0);
        const shouldInvertColor = (isXParityOdd !== isYParityOdd);

        let intermediateShade = initialShade;
        if (shouldInvertColor) {
            intermediateShade = (initialShade === "B" ? "W" : "B");
        }

        let adjustedX = xRelative;
        const adjustedY = yRelative;

        if (intermediateShade === "W") {
            adjustedX += unitDimension;
        }
        
        normalizedCoordinates.push({ x: adjustedX, y: adjustedY });
    }

    const maxOffsetCoord = 2 * unitDimension;
    const differenceGrid = Array.from({ length: maxOffsetCoord + 2 }, () => 
        Array.from({ length: maxOffsetCoord + 2 }, () => 0)
    );

    const targetPatternCells = [
        { r: 0, c: 0 },
        { r: 1, c: 1 },
        { r: 2, c: 0 }
    ];

    for (const point of normalizedCoordinates) {
        const pX = point.x;
        const pY = point.y;

        for (const targetCell of targetPatternCells) {
            const targetR = targetCell.r;
            const targetC = targetCell.c;

            let offsetXR_start = targetR * unitDimension - pX;
            let offsetXR_end = (targetR + 1) * unitDimension - 1 - pX;

            let offsetYR_start = targetC * unitDimension - pY;
            let offsetYR_end = (targetC + 1) * unitDimension - 1 - pY;

            const actualOffsetXR_start = Math.max(0, offsetXR_start);
            const actualOffsetXR_end = Math.min(maxOffsetCoord - 1, offsetXR_end);

            const actualOffsetYR_start = Math.max(0, offsetYR_start);
            const actualOffsetYR_end = Math.min(maxOffsetCoord - 1, offsetYR_end);

            if (actualOffsetXR_start <= actualOffsetXR_end && actualOffsetYR_start <= actualOffsetYR_end) {
                differenceGrid[actualOffsetXR_start][actualOffsetYR_start]++;
                differenceGrid[actualOffsetXR_start][actualOffsetYR_end + 1]--;
                differenceGrid[actualOffsetXR_end + 1][actualOffsetYR_start]--;
                differenceGrid[actualOffsetXR_end + 1][actualOffsetYR_end + 1]++;
            }
        }
    }

    let peakAlignmentCount = 0;
    const currentCounts = Array.from({ length: maxOffsetCoord }, () => Array(maxOffsetCoord).fill(0));

    for (let r = 0; r < maxOffsetCoord; r++) {
        for (let c = 0; c < maxOffsetCoord; c++) {
            let val = differenceGrid[r][c];
            if (r > 0) val += currentCounts[r - 1][c];
            if (c > 0) val += currentCounts[r][c - 1];
            if (r > 0 && c > 0) val -= currentCounts[r - 1][c - 1];
            
            currentCounts[r][c] = val;
            if (val > peakAlignmentCount) {
                peakAlignmentCount = val;
            }
            if (peakAlignmentCount === pointCount) {
                console.log(peakAlignmentCount);
                return;
            }
        }
    }

    console.log(peakAlignmentCount);
};

analyzePointAlignments(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));