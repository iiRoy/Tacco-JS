(function (programInput) {
    // Helper function to determine if the entire grid is filled with '*' characters.
    function checkAllStars(dim) {
        // Guard clause: if the dimension is non-positive, it cannot be "filled" in a meaningful way.
        // For this problem's constraints, 'dim' (n) is always positive, but this is a structural addition.
        if (dim <= 0) {
            return false;
        }

        const starCharacter = '*'; // Temporary constant for the character to check

        for (let rowIdx = 0; rowIdx < dim; rowIdx++) {
            for (let colIdx = 0; colIdx < dim; colIdx++) {
                const currentCellContent = gridData[rowIdx][colIdx]; // Helper variable for cell value
                if (currentCellContent !== starCharacter) {
                    return false;
                }
            }
        }
        return true;
    }

    // Helper function to verify if a rectangle of '.' characters exists,
    // replicating the original's specific out-of-bounds behavior.
    function verifyClearRectangle(startX, startY, rectDimension) {
        const dotCharacter = '.'; // Temporary constant for the character to check
        const rectEndRow = startY + rectDimension;
        const rectEndCol = startX + rectDimension;

        for (let currRow = startY; currRow <= rectEndRow; currRow++) {
            const currentRowData = gridData[currRow];

            // Original behavior: if 'currRow' is out of bounds (currentRowData is undefined),
            // the inner loop condition `data[i] && ...` would be false,
            // effectively skipping the inner loop and not returning false.
            // This means out-of-bounds rows are implicitly considered 'clear' by the original logic.
            if (currentRowData === undefined) {
                continue; // Skip to the next row, effectively treating it as 'clear'
            }

            for (let currCol = startX; currCol <= rectEndCol; currCol++) {
                // Original behavior: if 'currCol' is out of bounds (currentRowData[currCol] is undefined),
                // then `currentRowData[currCol] !== '.'` (undefined !== '.') is true,
                // causing the function to return false.
                const cellValue = currentRowData[currCol]; // Helper variable for cell value
                if (cellValue === undefined || cellValue !== dotCharacter) {
                    return false;
                }
            }
        }
        return true;
    }

    // --- Main program logic ---

    // Step 1: Clean the input by removing carriage returns.
    const cleanedInput = programInput.replace(/\r/g, '');
    // Step 2: Split the cleaned input into an array of lines.
    let processedLines = cleanedInput.split("\n");

    let gridData;
    let gridSize;

    const loopTerminationValue = 0; // Temporary constant for the loop termination condition

    // Using a do-while loop for structural change, which is functionally equivalent
    // to the original 'while(true)' loop with an explicit 'break' statement.
    do {
        gridSize = parseInt(processedLines.shift(), 10); // Parse the grid size, specifying radix 10.
        if (gridSize === loopTerminationValue) {
            break; // Exit the loop if the grid size is the termination value.
        }

        gridData = []; // Initialize an empty array to store grid rows.
        for (let outerIdx = 0; outerIdx < gridSize; outerIdx++) {
            const currentGridLine = processedLines.shift(); // Helper variable for the current line
            gridData.push(currentGridLine); // Add the line to the grid data.
        }

        const isGridCompletelyFilled = checkAllStars(gridSize); // Helper boolean variable for the condition
        if (isGridCompletelyFilled) {
            console.log(0); // Output 0 if the entire grid is filled with stars.
        } else {
            let currentRectSize = 1; // Renamed variable, representing (side_length - 1) of the largest square found.

            // Nested loops to find the largest square of '.' characters.
            for (let rowIter = 0; rowIter < gridSize; rowIter++) {
                for (let colIter = 0; colIter < gridSize; ) {
                    // Check if a rectangle of (currentRectSize+1) x (currentRectSize+1) is clear.
                    const isCurrentRectClear = verifyClearRectangle(colIter, rowIter, currentRectSize); // Helper variable for the condition result
                    if (isCurrentRectClear) {
                        currentRectSize++; // If clear, try for a larger square.
                    } else {
                        colIter += currentRectSize; // If not clear, skip 'currentRectSize' columns.
                    }
                }
            }
            console.log(currentRectSize); // Output the (side_length - 1) of the largest square.
        }
    } while (true); // The loop continues indefinitely until 'break' is encountered.

})(require("fs").readFileSync("/dev/stdin", "utf8"));
