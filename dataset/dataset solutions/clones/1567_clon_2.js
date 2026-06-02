/**
 * Processes the given input string.
 * @param {string} inputString The raw input data.
 */
function ProcessInput(inputString) {
    const [ initialLine, ...remainingLines ] = inputString.split('\n');
    const [ heightVal, widthVal ] = convertStringToNumberArray(initialLine);
    const gridData = create2DArray(remainingLines, ' ').map(rowItem => rowItem.map(cellItem => parseInt(cellItem, 10)));

    // Add a placeholder at the beginning of the grid data array
    gridData.unshift(null);

    /**
     * Stores the minimum step count for each row.
     * @type {Array<number>}
     */
    let outcomeArray = new Array(heightVal).fill(-1);
    // let minimumOutcomeSteps = new Array(heightVal).fill(widthVal * heightVal * 2); // This line was commented out in the original.

    for (let colIndex = 1; colIndex <= widthVal; colIndex++) {
        let currentX = colIndex, currentY = 1;
        let stepCount = 0;

        while (true) {
            // Determine if movement downwards is possible
            const canDescend = !(gridData[currentY][0] <= currentX && currentX <= gridData[currentY][1]);

            stepCount++; // Increment the step counter

            if (canDescend) {
                currentY++; // Move down to the next row

                // Update the minimum step count for the previous row if current path is shorter
                if (outcomeArray[currentY - 2] === -1 || stepCount < outcomeArray[currentY - 2]) {
                    outcomeArray[currentY - 2] = stepCount;
                }

                // If we've gone past the last row, break the loop
                if (currentY > heightVal) break;
            } else {
                currentX++; // Move right to the next column

                // If we've gone past the last column, break the loop
                if (currentX > widthVal) break;
            }
        }
    }

    // Output the results, each on a new line
    console.log(outcomeArray.join('\n'));

    // This function was defined but not used in the original main logic.
    // Keeping it for structural equivalence, but it's not called.
    function checkCanDescend(coordX, coordY, dataGrid) {
        const [ startBound, endBound ] = dataGrid[coordY];
        return !(startBound <= coordX && coordX <= endBound);
    }
    // console.log(checkCanDescend(1, 3, gridData), checkCanDescend(2, 3, gridData), checkCanDescend(3, 3, gridData), checkCanDescend(4, 3, gridData));
}

//* Do not modify anything below this line (reads from standard input and calls the main processing function)
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

////////// Helper Functions

/**
 * Converts a string into an array of numbers.
 * @param {string} inputStr The string to convert.
 * @param {string} [separatorChar=' '] The delimiter character.
 * @returns {Array<number>} An array of parsed integers.
 */
function convertStringToNumberArray(inputStr, separatorChar = ' ') {
    return inputStr.split(separatorChar).map(strPart => parseInt(strPart, 10));
}

/**
 * Transforms a string into an array of BigInts.
 * @param {string} inputStringVal The string to process.
 * @param {string} [delimiterChar=' '] The character used for splitting.
 * @returns {Array<BigInt>} An array of BigInt values.
 */
function parseToBigIntArray(inputStringVal, delimiterChar = ' ') {
    return inputStringVal.split(delimiterChar).map(segment => BigInt(segment));
}

/**
 * Generates a 2D array from an array of strings.
 * @param {Array<string>} stringArray An array of strings, each representing a row.
 * @param {string} [splitChar=' '] The character to split each string by.
 * @returns {Array<Array<string>>} A two-dimensional array of strings.
 */
function create2DArray(stringArray, splitChar = ' ') {
    const resultMatrix = stringArray.map(rowString => rowString.split(splitChar));
    return resultMatrix;
}

/**
 * Computes the sum of numbers in an array.
 * @param {Array<number>} numberCollection An array of numerical values.
 * @returns {number} The total sum.
 */
function calculateSum(numberCollection) {
    return numberCollection.reduce((accumulator, currentValue) => accumulator + currentValue);
}
