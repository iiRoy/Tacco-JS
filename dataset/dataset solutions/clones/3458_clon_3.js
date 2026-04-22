const padBinary = (num, length) => {
    // Converts a number to its binary string representation.
    // Pads with leading zeros to ensure the string reaches the specified length.
    return num.toString(2).padStart(length, '0');
};

function AmidaPathCounter(rawData) {
    // Parses the input string, which contains three space-separated integers.
    // These represent the total height levels, the number of columns, and the target final column.
    const parsedParameters = rawData.split(' ').map(val => parseInt(val, 10));
    
    const heightLevels = parsedParameters[0]; // Corresponds to 'H' in the original problem.
    const columnCount = parsedParameters[1]; // Corresponds to 'W' in the original problem.
    const finalDestinationColumn = parsedParameters[2]; // Corresponds to 'K' in the original problem (1-indexed).

    // Defines the modulus value for all calculations to keep results within a specific range
    // and prevent integer overflow, as commonly required in competitive programming.
    const moduloVal = 1000000007; // 10^9 + 7

    // Handles a base case: if there's only one column, there's only one possible path.
    if (columnCount === 1) {
        return 1;
    }

    // --- Step 1: Generate all permissible Amida bar configurations ---
    // An Amida configuration describes the presence or absence of horizontal bars
    // at a specific height level.
    // There are (columnCount - 1) possible positions for bars between columns.
    // '1' indicates a bar, '0' indicates no bar.
    // A key rule is that consecutive bars are not allowed (e.g., '11' is an invalid segment).

    // Calculate the maximum integer value that corresponds to a binary string of length (columnCount - 1).
    const maxConfigInteger = 1 << (columnCount - 1); // Equivalent to 2^(columnCount-1)

    const intermediateConfigurations = [];
    // Generate all binary strings of length (columnCount - 1).
    for (let i = 0; i < maxConfigInteger; i++) {
        intermediateConfigurations.push(padBinary(i, columnCount - 1));
    }

    // Filter these configurations: remove any that contain consecutive '1's (bars).
    // For each valid configuration, prepend and append a '0'. This simplifies
    // boundary checks during the dynamic programming phase by ensuring that
    // `configPattern[0]` and `configPattern[columnCount]` are always '0',
    // representing no bars extending beyond the grid boundaries.
    const permissibleBarConfigurations = intermediateConfigurations
        .filter(configStr => !configStr.includes('11'))
        .map(configStr => '0' + configStr + '0'); // Example for W=3: '010' becomes '00100'

    // --- Step 2: Initialize the Dynamic Programming table ---
    // The `pathCounts` table stores the number of ways to reach a specific column
    // at a given height level.
    // `pathCounts[h][c]` represents the number of ways to arrive at column `c`
    // after `h` height transitions. Columns are 0-indexed.
    const pathCounts = Array(heightLevels + 1).fill(null).map(() => Array(columnCount).fill(0));
    
    // Base case for DP: At height level 0 (the starting point), there is 1 way
    // to be at column 0. All other columns at height 0 have 0 ways.
    pathCounts[0][0] = 1;

    // --- Step 3: Populate the DP table ---
    // Iterate through each height level, starting from the first transition (level 1).
    for (let currentLevel = 1; currentLevel <= heightLevels; currentLevel++) {
        // For each height level, iterate through every valid Amida bar configuration.
        permissibleBarConfigurations.forEach(configPattern => {
            // For the current configuration, calculate path counts for each column.
            for (let currentColumn = 0; currentColumn < columnCount; currentColumn++) {
                // Determine if a bar exists to the immediate left or right of the current column.
                // `configPattern[j]` refers to the bar between column `j-1` and `j`.
                // `configPattern[j+1]` refers to the bar between column `j` and `j+1`.
                const hasBarToLeft = (configPattern[currentColumn] === '1');
                const hasBarToRight = (configPattern[currentColumn + 1] === '1');

                // Apply transition rules based on bar presence.
                // Since consecutive bars are forbidden, only one of these conditions can be true
                // for a given column (unless both are false).
                if (hasBarToLeft) {
                    // If a bar exists to the left (between currentColumn-1 and currentColumn),
                    // the path must have come from currentColumn-1.
                    // Ensure the source column (currentColumn-1) is within bounds.
                    if (currentColumn > 0) {
                        pathCounts[currentLevel][currentColumn] = (pathCounts[currentLevel][currentColumn] + pathCounts[currentLevel - 1][currentColumn - 1]) % moduloVal;
                    }
                } else if (hasBarToRight) {
                    // If a bar exists to the right (between currentColumn and currentColumn+1),
                    // the path must have come from currentColumn+1.
                    // Ensure the source column (currentColumn+1) is within bounds.
                    if (currentColumn < columnCount - 1) {
                        pathCounts[currentLevel][currentColumn] = (pathCounts[currentLevel][currentColumn] + pathCounts[currentLevel - 1][currentColumn + 1]) % moduloVal;
                    }
                } else {
                    // If no bars exist immediately to the left or right of currentColumn,
                    // the path must have come from the same column (currentColumn).
                    pathCounts[currentLevel][currentColumn] = (pathCounts[currentLevel][currentColumn] + pathCounts[currentLevel - 1][currentColumn]) % moduloVal;
                }
            }
        });
    }
    
    // The final answer is the number of ways to reach the target column (K-1, 0-indexed)
    // at the maximum height level (H).
    return pathCounts[heightLevels][finalDestinationColumn - 1];
}

// Standard boilerplate for running the script in a Node.js environment,
// typically used in competitive programming to read input from standard input.
if (typeof require !== 'undefined' && typeof module !== 'undefined') {
    const fileSystem = require("fs");
    // Reads the entire content of the standard input stream, assumes UTF-8 encoding.
    // Passes the content to the main AmidaPathCounter function and prints the result.
    console.log(AmidaPathCounter(fileSystem.readFileSync("/dev/stdin", "utf8")));
}