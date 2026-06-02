function processInput(inputStr) {
    const parsedNumbers = inputStr.split(" ").map(numString => parseInt(numString, 10));

    let valA, valB, charA, charB;

    const firstValue = parsedNumbers[0];
    const secondValue = parsedNumbers[1];
    const dotCharacter = ".";
    const hashCharacter = "#";

    if (firstValue > secondValue) {
        valA = firstValue;
        valB = secondValue;
        charA = dotCharacter;
        charB = hashCharacter;
    } else {
        valA = secondValue;
        valB = firstValue;
        charA = hashCharacter;
        charB = dotCharacter;
    }

    const squareRootOfValA = Math.sqrt(valA);
    const ceilingOfSquareRoot = Math.ceil(squareRootOfValA);
    const gridDimension = ceilingOfSquareRoot * 4;

    const patternOne = [charA, charA, charA, charB];
    const patternTwo = [charA, charB, charA, charB];
    const patternZero = [charB, charB, charB, charB];

    let resultGrid = [];
    let countA = 1, countB = 1;

    const appendFourRowPattern = (gridReference, baseRowIndex, p0, p1, p2, p3) => {
        gridReference[baseRowIndex].push(...p0);
        gridReference[baseRowIndex + 1].push(...p1);
        gridReference[baseRowIndex + 2].push(...p2);
        gridReference[baseRowIndex + 3].push(...p3);
    };

    for (let rowIndex = 0; rowIndex < gridDimension; rowIndex += 4) {
        for (let k = 0; k < 4; k++) {
            resultGrid[rowIndex + k] = [];
        }

        for (let colIndex = 0; colIndex < gridDimension; colIndex += 4) {
            if (rowIndex === 0 && colIndex === 0) {
                appendFourRowPattern(resultGrid, rowIndex, patternOne, patternOne, patternOne, patternZero);
            } else if (countA === valA) {
                appendFourRowPattern(resultGrid, rowIndex, patternZero, patternZero, patternZero, patternZero);
            } else if (countB === valB) {
                appendFourRowPattern(resultGrid, rowIndex, patternOne, patternOne, patternOne, patternZero);
                countA++;
            } else {
                appendFourRowPattern(resultGrid, rowIndex, patternOne, patternTwo, patternOne, patternZero);
                countA++;
                countB++;
            }
        }
    }

    for (let rowIndex = 0; rowIndex < gridDimension; rowIndex++) {
        resultGrid[rowIndex] = resultGrid[rowIndex].join("");
    }

    console.log("%d %d\n%s", gridDimension, gridDimension, resultGrid.join("\n"));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
