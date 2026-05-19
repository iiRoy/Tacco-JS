function processGridData(inputString) {
    const inputNumbers = inputString.split(" ").map(numStr => parseInt(numStr, 10));
    const num1 = inputNumbers[0];
    const num2 = inputNumbers[1];

    const getCharacterSet = (isFirstLarger) => {
        return isFirstLarger ? { primaryChar: ".", secondaryChar: "#" } : { primaryChar: "#", secondaryChar: "." };
    };

    const isNum1Greater = num1 > num2;
    const { primaryChar: charC, secondaryChar: charD } = getCharacterSet(isNum1Greater);

    const valA = Math.max(num1, num2);
    const valB = Math.min(num1, num2);

    const gridDimension = Math.ceil(Math.sqrt(valA)) * 4;

    const patternC_C_C_D = [charC, charC, charC, charD];
    const patternC_D_C_D = [charC, charD, charC, charD];
    const patternD_D_D_D = [charD, charD, charD, charD];

    const outputGrid = Array.from({ length: gridDimension }, () => []);

    let currentCounterA = 1;
    let currentCounterB = 1;

    const addPatternBlock = (grid, startRowIndex, patterns) => {
        grid[startRowIndex].push(...patterns[0]);
        grid[startRowIndex + 1].push(...patterns[1]);
        grid[startRowIndex + 2].push(...patterns[2]);
        grid[startRowIndex + 3].push(...patterns[3]);
    };

    for (let rowIndex = 0; rowIndex < gridDimension; rowIndex += 4) {
        for (let colIndex = 0; colIndex < gridDimension; colIndex += 4) {
            const isInitialBlock = (rowIndex === 0 && colIndex === 0);

            if (isInitialBlock) {
                addPatternBlock(outputGrid, rowIndex, [patternC_C_C_D, patternC_C_C_D, patternC_C_C_D, patternD_D_D_D]);
            } else if (currentCounterA === valA) {
                addPatternBlock(outputGrid, rowIndex, [patternD_D_D_D, patternD_D_D_D, patternD_D_D_D, patternD_D_D_D]);
            } else if (currentCounterB === valB) {
                addPatternBlock(outputGrid, rowIndex, [patternC_C_C_D, patternC_C_C_D, patternC_C_C_D, patternD_D_D_D]);
                currentCounterA++;
            } else {
                addPatternBlock(outputGrid, rowIndex, [patternC_C_C_D, patternC_D_C_D, patternC_C_C_D, patternD_D_D_D]);
                currentCounterA++;
                currentCounterB++;
            }
        }
    }

    const finalGridLines = outputGrid.map(row => row.join(""));
    console.log("%d %d\n%s", gridDimension, gridDimension, finalGridLines.join("\n"));
}

processGridData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
