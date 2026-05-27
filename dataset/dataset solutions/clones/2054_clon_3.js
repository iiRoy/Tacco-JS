function Main(inputData) {
    const params = inputData[0].split(" ");
    const numRows = parseInt(params[0], 10);
    const numCols = parseInt(params[1], 10);
    const maxCapacity = parseInt(params[2], 10);

    const gridData = [];
    for (let rowIndex = 1; rowIndex <= numRows; rowIndex++) {
        gridData.push(inputData[rowIndex]);
    }

    minCutsGlobal = numRows * numCols;

    const numHorizontalCuts = numRows - 1;
    const bitmaskCombinations = generateBitmasks(numHorizontalCuts);

    for (const currentMask of bitmaskCombinations) {
        evaluateCuts(gridData, currentMask, maxCapacity, numRows);
    }

    console.log(minCutsGlobal);
}

let minCutsGlobal = 0;

function evaluateCuts(gridData, currentMask, maxCapacity, numRows) {
    let currentCutsCount = currentMask.cutCount;
    const columnCount = gridData[0].length;

    let currentBoxCounts = [];
    let previousCutFlag = 0;

    columnIteration: for (let colIdx = 0; colIdx < columnCount; colIdx++) {
        let currentBoxIndex = 0;
        for (let rowIdx = 0; rowIdx < numRows; rowIdx++) {
            if (currentBoxCounts[currentBoxIndex] === undefined) {
                currentBoxCounts[currentBoxIndex] = 0;
            }

            if (gridData[rowIdx][colIdx] === "1") {
                currentBoxCounts[currentBoxIndex]++;
            }

            if (currentMask.maskString[rowIdx] === "1") {
                currentBoxIndex++;
            }

            if (currentBoxCounts[currentBoxIndex] > maxCapacity) {
                currentCutsCount++;
                currentBoxCounts = [];
                colIdx--;

                if (previousCutFlag > 0) {
                    previousCutFlag = 0;
                    continue columnIteration;
                } else {
                    return;
                }
            }
        }

        if (colIdx === columnCount - 1) {
            minCutsGlobal = Math.min(minCutsGlobal, currentCutsCount);
        }
    }
}

function generateBitmasks(length) {
    const maskList = [];
    const totalMasks = 1 << length;

    for (let i = 0; i < totalMasks; i++) {
        const binaryString = padBinaryString(i.toString(2), length);
        maskList.push({
            cutCount: popCount32(i),
            maskString: binaryString
        });
    }
    return maskList.sort((a, b) => a.cutCount - b.cutCount);
}

function padBinaryString(binaryStr, targetLength) {
    return ("00000000000000000000000000000000" + binaryStr).slice(-targetLength);
}

function popCount32(value) {
  value = value - ((value >> 1) & 0x55555555);
  value = (value & 0x33333333) + ((value >> 2) & 0x33333333);
  return ((value + (value >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
