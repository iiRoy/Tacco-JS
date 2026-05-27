const gridInput = require("fs").readFileSync("/dev/stdin", "utf8");

(function(inputDataString) {
    const lineSegments = inputDataString.split('\n');
    const [rowsCount, colsCount] = lineSegments[0].split(' ').map(Number);
    const startPoint = lineSegments[1].split(' ').map(Number);
    const endPoint = lineSegments[2].split(' ').map(Number);

    const gameMap = lineSegments.slice(3, 3 + rowsCount).map(rowStr => rowStr.split(''));

    const wallSymbol = '#';

    const isWithinBoundsAndClear = (r, c) => {
        return r >= 0 && r < rowsCount && c >= 0 && c < colsCount && gameMap[r][c] !== wallSymbol;
    };

    const costMatrix = Array.from({ length: rowsCount }, () => Array(colsCount).fill(Infinity));

    const zeroQ = [];
    const oneQ = [];

    const initialRow = startPoint[0] - 1;
    const initialCol = startPoint[1] - 1;

    costMatrix[initialRow][initialCol] = 0;
    zeroQ.push([initialRow, initialCol]);

    while (zeroQ.length > 0 || oneQ.length > 0) {
        if (zeroQ.length === 0 && oneQ.length > 0) {
            while (oneQ.length > 0) {
                zeroQ.push(oneQ.shift());
            }
        }

        const [cellRow, cellCol] = zeroQ.shift();

        const currentPathValue = costMatrix[cellRow][cellCol];

        const directDeltas = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        directDeltas.forEach(([rowDelta, colDelta]) => {
            const neighborRow = cellRow + rowDelta;
            const neighborCol = cellCol + colDelta;

            if (isWithinBoundsAndClear(neighborRow, neighborCol) && currentPathValue < costMatrix[neighborRow][neighborCol]) {
                costMatrix[neighborRow][neighborCol] = currentPathValue;
                zeroQ.push([neighborRow, neighborCol]);
            }
        });

        const warpCost = currentPathValue + 1;
        for (let rOffset = -2; rOffset <= 2; rOffset++) {
            for (let cOffset = -2; cOffset <= 2; cOffset++) {
                if (Math.abs(rOffset) <= 1 && Math.abs(cOffset) <= 1) {
                    continue;
                }

                const neighborRow = cellRow + rOffset;
                const neighborCol = cellCol + cOffset;

                if (isWithinBoundsAndClear(neighborRow, neighborCol) && warpCost < costMatrix[neighborRow][neighborCol]) {
                    costMatrix[neighborRow][neighborCol] = warpCost;
                    oneQ.push([neighborRow, neighborCol]);
                }
            }
        }
    }

    const finalRow = endPoint[0] - 1;
    const finalCol = endPoint[1] - 1;

    const finalResult = costMatrix[finalRow][finalCol];
    console.log(finalResult === Infinity ? -1 : finalResult);

})(gridInput);
