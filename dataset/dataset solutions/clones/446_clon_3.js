const fileSystem = require('fs');
let inputLines = fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split("\n");

while (true) {
    const dimensionInput = inputLines.shift().split(" ").map(Number);
    const currentWidth = dimensionInput[0];
    const currentHeight = dimensionInput[1];

    const isExitCondition = (currentWidth === 0 && currentHeight === 0);
    if (isExitCondition) {
        break;
    }

    const gridData = [];
    for (let rowIdx = 0; rowIdx < currentHeight; rowIdx++) {
        gridData.push(inputLines.shift().split(" ").map(Number));
    }

    const dynamicProg = Array.from({ length: currentHeight }, () => Array(currentWidth).fill(0));

    for (let rowIdx = 0; rowIdx < currentHeight; rowIdx++) {
        for (let colIdx = 0; colIdx < currentWidth; colIdx++) {
            const currentGridValue = gridData[rowIdx][colIdx];

            if (rowIdx === 0 && currentGridValue === 0) {
                dynamicProg[rowIdx][colIdx] = 1;
            } else if (rowIdx >= 1) {
                const previousRowIdx = rowIdx - 1;
                const twoRowsUpIdx = rowIdx - 2;

                const isBlockedPrevLeft = (colIdx === 0 || gridData[previousRowIdx][colIdx - 1] === 2);
                const isBlockedPrevCenter = (gridData[previousRowIdx][colIdx] === 2);
                const isBlockedPrevRight = (colIdx === currentWidth - 1 || gridData[previousRowIdx][colIdx + 1] === 2);
                const isBlockedTwoUp = (rowIdx >= 2 && gridData[twoRowsUpIdx][colIdx] === 2);

                const valueFromPrevLeft = isBlockedPrevLeft ? 0 : dynamicProg[previousRowIdx][colIdx - 1];
                const valueFromPrevCenter = isBlockedPrevCenter ? 0 : dynamicProg[previousRowIdx][colIdx];
                const valueFromPrevRight = isBlockedPrevRight ? 0 : dynamicProg[previousRowIdx][colIdx + 1];
                const valueFromTwoUp = isBlockedTwoUp ? dynamicProg[twoRowsUpIdx][colIdx] : 0;

                if (currentGridValue === 0) {
                    dynamicProg[rowIdx][colIdx] += valueFromPrevLeft + valueFromPrevCenter + valueFromPrevRight + valueFromTwoUp;
                } else if (currentGridValue === 1) {
                    dynamicProg[rowIdx][colIdx] = 0;
                } else if (currentGridValue === 2) {
                    dynamicProg[rowIdx][colIdx] += valueFromPrevCenter + valueFromTwoUp;
                }
            }
        }
    }

    let totalPaths = 0;
    const lastRowIndex = currentHeight - 1;
    const secondLastRowIndex = currentHeight - 2;

    // Sum for the second to last row if it exists
    if (currentHeight >= 2) {
        for (let colIdx = 0; colIdx < currentWidth; colIdx++) {
            if (gridData[secondLastRowIndex][colIdx] === 2) {
                totalPaths += dynamicProg[secondLastRowIndex][colIdx];
            }
        }
    }

    // Sum for the last row if it exists
    if (currentHeight >= 1) {
        for (let colIdx = 0; colIdx < currentWidth; colIdx++) {
            const lastRowGridValue = gridData[lastRowIndex][colIdx];
            if (lastRowGridValue === 0 || lastRowGridValue === 2) {
                totalPaths += dynamicProg[lastRowIndex][colIdx];
            }
        }
    }
    
    console.log(totalPaths);
}
