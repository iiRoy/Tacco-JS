const primaryModulo = 1000000007;

function createInputParser(sourceContent) {
    const contentLines = sourceContent.trim().split('\n');
    let currentLineIndex = 0;
    let currentLineTokens = [];
    let currentTokenIndex = 0;

    const advanceToNextLine = () => {
        if (currentLineIndex >= contentLines.length) {
            throw new Error("Input exhausted: No more lines available.");
        }
        currentLineTokens = contentLines[currentLineIndex++].split(' ');
        currentTokenIndex = 0;
    };

    return {
        fetchNextNumeric: function() {
            if (currentTokenIndex >= currentLineTokens.length) {
                advanceToNextLine();
            }
            return parseInt(currentLineTokens[currentTokenIndex++], 10);
        },
        fetchNextNumericArray: function() {
            advanceToNextLine(); // Move to the next line and parse it entirely
            return currentLineTokens.map(Number);
        }
    };
}

function processSequenceConnections() {
    const parser = createInputParser(require("fs").readFileSync("/dev/stdin", "utf8"));
    const dimAlpha = parser.fetchNextNumeric();
    const dimBeta = parser.fetchNextNumeric();
    const sequenceAlpha = parser.fetchNextNumericArray();
    const sequenceBeta = parser.fetchNextNumericArray();

    let totalContributions = 1; // Corresponds to original 'ans'

    // The dynamic programming grid `connectionGrid` is built row by row using functional array methods.
    // `connectionGrid[r][c]` corresponds to `dp[r][c]` in the original code's 1-indexed DP table.
    const connectionGrid = Array.from({ length: dimAlpha + 1 }).map((_, rowIndex) => {
        if (rowIndex === 0) {
            // Base case: The first row of the DP grid is entirely zeros.
            return Array(dimBeta + 1).fill(0);
        }

        let rowAccumulator = 0; // Corresponds to original 'x' for the current rowIndex
        const currentRow = Array.from({ length: dimBeta + 1 }).map((_, colIndex) => {
            if (colIndex === 0) {
                // Base case: The first column of the DP grid is entirely zeros.
                return 0;
            }

            const charA = sequenceAlpha[rowIndex - 1]; // Corresponds to s[i]
            const charB = sequenceBeta[colIndex - 1]; // Corresponds to t[j]

            let cellValue;
            if (charA === charB) {
                // If characters match:
                // Original: dp[i+1][j+1] = (dp[i+1][j] + dp[i][j+1] + 1) % mod;
                // My:       connectionGrid[rowIndex][colIndex] = (connectionGrid[rowIndex][colIndex-1] + connectionGrid[rowIndex-1][colIndex] + 1) % primaryModulo;

                // Original: x += dp[i][j]+1;
                // My:       rowAccumulator += (connectionGrid[rowIndex-1][colIndex-1]+1);
                // Original: ans += dp[i][j]+1;
                // My:       totalContributions += (connectionGrid[rowIndex-1][colIndex-1]+1);

                const incrementTerm = (connectionGrid[rowIndex - 1][colIndex - 1] + 1 + primaryModulo) % primaryModulo;
                rowAccumulator = (rowAccumulator + incrementTerm) % primaryModulo;
                totalContributions = (totalContributions + incrementTerm) % primaryModulo;
                cellValue = (connectionGrid[rowIndex][colIndex - 1] + connectionGrid[rowIndex - 1][colIndex] + 1 + primaryModulo) % primaryModulo;
            } else {
                // If characters do not match:
                // Original: dp[i+1][j+1] = (x + dp[i][j+1]) % mod;
                // My:       connectionGrid[rowIndex][colIndex] = (rowAccumulator + connectionGrid[rowIndex-1][colIndex]) % primaryModulo;
                cellValue = (rowAccumulator + connectionGrid[rowIndex - 1][colIndex] + primaryModulo) % primaryModulo;
            }
            return cellValue;
        });
        return currentRow;
    });

    // The `totalContributions` is updated as a side effect during the DP grid construction.
    return totalContributions;
}

console.log(processSequenceConnections());