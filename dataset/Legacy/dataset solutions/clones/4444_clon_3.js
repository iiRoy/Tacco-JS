function readInputFromFile() {
    return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

function writeOutputToConsole(text) {
    console.log(text);
}

const conversionStrategies = {
    0: (val) => val,
    1: (val) => parseInt(val, 10),
    2: (val) => val.split(" "),
    3: (val) => val.split("\n"),
    4: (val) => val.split(" ").map(Number),
    5: (val) => val.split("\n").map(Number),
    6: (val) => val.split(""),
    7: (val) => val.split("").map(Number),
};

function processInput(inputValue, conversionType) {
    const strategy = conversionStrategies[conversionType];
    if (typeof strategy === 'function') {
        return strategy(inputValue);
    }
    return inputValue;
}

function solveProblem(rawInputString) {
    const inputLines = processInput(rawInputString, 3);

    const [gridHeight, gridWidth] = processInput(inputLines[0], 4);
    // The variable N (total blocks) from inputLines[1] is not used in the original logic,
    // so it is omitted here as a Type III modification (removal of non-essential code).
    const blockCounts = processInput(inputLines[2], 4);

    const resultGrid = Array.from({ length: gridHeight }, () => new Array(gridWidth));

    let currentBlockValue = 1;

    const getNextBlockValueAndDecrementCount = () => {
        while (blockCounts[currentBlockValue - 1] === 0) {
            currentBlockValue++;
        }
        blockCounts[currentBlockValue - 1]--;
        return currentBlockValue;
    };

    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        if (rowIdx % 2 === 0) {
            for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
                resultGrid[rowIdx][colIdx] = getNextBlockValueAndDecrementCount();
            }
        } else {
            for (let colIdx = gridWidth - 1; colIdx >= 0; colIdx--) {
                resultGrid[rowIdx][colIdx] = getNextBlockValueAndDecrementCount();
            }
        }
    }

    const formattedOutput = resultGrid.map(row => row.join(" ")).join("\n");

    writeOutputToConsole(formattedOutput);
}

solveProblem(readInputFromFile());
