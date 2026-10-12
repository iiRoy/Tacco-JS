function ProcessInput(inputString) {
    // Parse the input string into an array of integers.
    let parsedNumbers = inputString.split(" ").map(numStr => parseInt(numStr, 10));

    let firstValue, secondValue, charTypeA, charTypeB;

    // Determine the larger number and assign characters based on comparison.
    if (parsedNumbers[0] > parsedNumbers[1]) {
        firstValue = parsedNumbers[0];
        secondValue = parsedNumbers[1];
        charTypeA = ".";
        charTypeB = "#";
    } else {
        secondValue = parsedNumbers[0];
        firstValue = parsedNumbers[1];
        charTypeB = ".";
        charTypeA = "#";
    }

    // Calculate the dimension of the square grid.
    const gridSize = Math.ceil(Math.sqrt(firstValue)) * 4;

    // Define base patterns for grid cells.
    const patternOne = [charTypeA, charTypeA, charTypeA, charTypeB];
    const patternMixed = [charTypeA, charTypeB, charTypeA, charTypeB];
    const patternZero = [charTypeB, charTypeB, charTypeB, charTypeB];

    // Initialize the grid structure.
    let outputGrid = [];
    let countA = 1, countB = 1; // Counters for tracking values

    // Populate the grid in 4x4 blocks.
    for (let rowIndex = 0; rowIndex < gridSize; rowIndex += 4) {
        outputGrid[rowIndex] = [];
        outputGrid[rowIndex + 1] = [];
        outputGrid[rowIndex + 2] = [];
        outputGrid[rowIndex + 3] = [];

        for (let colIndex = 0; colIndex < gridSize; colIndex += 4) {
            if (rowIndex === 0 && colIndex === 0) {
                // Special handling for the top-left 4x4 block.
                outputGrid[rowIndex].push(...patternOne);
                outputGrid[rowIndex + 1].push(...patternOne);
                outputGrid[rowIndex + 2].push(...patternOne);
                outputGrid[rowIndex + 3].push(...patternZero);
            } else if (countA === firstValue) {
                // If firstValue limit reached, fill with patternZero.
                outputGrid[rowIndex].push(...patternZero);
                outputGrid[rowIndex + 1].push(...patternZero);
                outputGrid[rowIndex + 2].push(...patternZero);
                outputGrid[rowIndex + 3].push(...patternZero);
            } else if (countB === secondValue) {
                // If secondValue limit reached, fill with patternOne and increment countA.
                outputGrid[rowIndex].push(...patternOne);
                outputGrid[rowIndex + 1].push(...patternOne);
                outputGrid[rowIndex + 2].push(...patternOne);
                outputGrid[rowIndex + 3].push(...patternZero);
                countA++;
            } else {
                // Default case: fill with mixed patterns and increment both counters.
                outputGrid[rowIndex].push(...patternOne);
                outputGrid[rowIndex + 1].push(...patternMixed);
                outputGrid[rowIndex + 2].push(...patternOne);
                outputGrid[rowIndex + 3].push(...patternZero);
                countA++;
                countB++;
            }
        }
    }

    // Join the characters in each row to form strings.
    for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
        outputGrid[rowIndex] = outputGrid[rowIndex].join("");
    }

    // Print the grid dimensions and the grid itself.
    console.log("%d %d\n%s", gridSize, gridSize, outputGrid.join("\n"));
}

// Read input from standard input, trim whitespace, and pass to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
