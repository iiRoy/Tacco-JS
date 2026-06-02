function generateBinaryCombinations(length) {
    if (length === 0) {
        return [[]];
    }
    let patterns = [[0], [1]];
    for (let currentLength = 1; currentLength < length; currentLength++) {
        const nextLevelPatterns = [];
        for (const existingPattern of patterns) {
            nextLevelPatterns.push([...existingPattern, 0]);
            nextLevelPatterns.push([...existingPattern, 1]);
        }
        patterns = nextLevelPatterns;
    }
    return patterns;
}

function solveGridProblem(rawInputString) {
    const inputLines = rawInputString.split("\n");
    const [gridRowsStr, gridColsStr, targetBlackCellsStr] = inputLines[0].split(" ");
    
    const gridRows = parseInt(gridRowsStr, 10);
    const gridCols = parseInt(gridColsStr, 10);
    const targetBlackCells = parseInt(targetBlackCellsStr, 10);

    const gridData = inputLines.slice(1, gridRows + 1).map(line => line.split(""));

    const rowSelectionPatterns = generateBinaryCombinations(gridRows);
    const colSelectionPatterns = generateBinaryCombinations(gridCols);

    let validCombinationsCount = 0;

    for (let patternIndexRow = 0; patternIndexRow < rowSelectionPatterns.length; patternIndexRow++) {
        for (let patternIndexCol = 0; patternIndexCol < colSelectionPatterns.length; patternIndexCol++) {
            let currentBlackCellCount = 0;
            const currentRowPattern = rowSelectionPatterns[patternIndexRow];
            const currentColPattern = colSelectionPatterns[patternIndexCol];

            for (let currentRowIdx = 0; currentRowIdx < gridRows; currentRowIdx++) {
                for (let currentColIdx = 0; currentColIdx < gridCols; currentColIdx++) {
                    const isRowSelectedForExclusion = currentRowPattern[currentRowIdx] === 0;
                    const isColSelectedForExclusion = currentColPattern[currentColIdx] === 0;
                    const isGridCellBlack = gridData[currentRowIdx][currentColIdx] === "#";

                    if (isRowSelectedForExclusion && isColSelectedForExclusion && isGridCellBlack) {
                        currentBlackCellCount++;
                    }
                }
            }

            if (currentBlackCellCount === targetBlackCells) {
                validCombinationsCount++;
            }
        }
    }

    console.log('%s', validCombinationsCount);
    return validCombinationsCount;
}

function runTestCases(caseNumber) {
    const inputElement = document.getElementById("input" + caseNumber);
    const outputElement = document.getElementById("output" + caseNumber);

    if (!inputElement || !outputElement) {
        console.error(`Test case elements for ${caseNumber} not found.`);
        return;
    }

    const testInput = inputElement.value;
    const actualAnswer = solveGridProblem(testInput);
    const expectedAnswer = outputElement.value.split("\n")[0];

    let testResultStatus = "WA";
    if (actualAnswer == expectedAnswer) {
        testResultStatus = "AC";
    }
    document.getElementById("result" + caseNumber).innerHTML = testResultStatus;
}

solveGridProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
