'use strict';

const processInput = (rawData) => {
    const parseInteger = (strVal) => parseInt(strVal, 10);

    const lines = rawData.split('\n');
    const [heightStr, widthStr] = lines[0].split(' ');

    const height = parseInteger(heightStr);
    const width = parseInteger(widthStr);

    const gridData = [];
    for (let rowIdx = 0; rowIdx < height; rowIdx++) {
        gridData[rowIdx] = [];
        const rowValuesStr = lines[rowIdx + 1].split(' ');
        for (let colIdx = 0; colIdx < width; colIdx++) {
            gridData[rowIdx][colIdx] = parseInteger(rowValuesStr[colIdx]);
        }
    }

    const moveOperations = [];

    const transferParity = (sourceCol, sourceRow, destCol, destRow) => {
        const formattedMove = [sourceRow + 1, sourceCol + 1, destRow + 1, destCol + 1].join(' ');
        moveOperations.push(formattedMove);
        gridData[destRow][destCol]++;
        gridData[sourceRow][sourceCol]--;
    };

    const isOdd = (num) => num % 2 !== 0;

    // 奇数の場合は隣に移動していくのを繰り返す
    for (let rowIdx = 0; rowIdx < height; rowIdx++) {
        for (let colIdx = 0; colIdx < width; colIdx++) {
            const currentCellValue = gridData[rowIdx][colIdx];
            if (isOdd(currentCellValue)) {
                // 奇数
                const canMoveRight = (colIdx + 1 < width);
                const canMoveDown = (rowIdx + 1 < height);

                if (canMoveRight) {
                    // 右へ
                    transferParity(colIdx, rowIdx, colIdx + 1, rowIdx);
                } else if (canMoveDown) {
                    // 下へ
                    transferParity(colIdx, rowIdx, colIdx, rowIdx + 1);
                }
            }
        }
    }

    console.log(moveOperations.length);
    console.log(moveOperations.join('\n') + '\n');
};

const isDevelopmentMode = false;

if (isDevelopmentMode) {
    processInput('2 3\n1 2 3\n0 1 1\n');
} else {
    processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
}
