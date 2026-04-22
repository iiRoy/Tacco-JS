function processInput(incomingData) {
    const lines = incomingData.trim().split('\n');
    const primaryString = lines[0].split(' ')[0];
    const secondaryString = lines[1].split(' ')[0];

    const len1 = primaryString.length;
    const len2 = secondaryString.length;

    // Initialize DP table (lcsMatrix[i][j] stores LCS length of primaryString[0...i-1] and secondaryString[0...j-1])
    const lcsMatrix = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

    // Fill DP table
    for (let idx1 = 1; idx1 <= len1; idx1++) {
        for (let idx2 = 1; idx2 <= len2; idx2++) {
            if (primaryString.charAt(idx1 - 1) === secondaryString.charAt(idx2 - 1)) {
                lcsMatrix[idx1][idx2] = lcsMatrix[idx1 - 1][idx2 - 1] + 1;
            } else {
                lcsMatrix[idx1][idx2] = Math.max(lcsMatrix[idx1 - 1][idx2], lcsMatrix[idx1][idx2 - 1]);
            }
        }
    }

    // Reconstruct LCS using recursion
    function retrieveLCS(currIdx1, currIdx2) {
        if (currIdx1 === 0 || currIdx2 === 0) {
            return "";
        }

        if (primaryString.charAt(currIdx1 - 1) === secondaryString.charAt(currIdx2 - 1)) {
            return retrieveLCS(currIdx1 - 1, currIdx2 - 1) + primaryString.charAt(currIdx1 - 1);
        } else {
            if (lcsMatrix[currIdx1 - 1][currIdx2] > lcsMatrix[currIdx1][currIdx2 - 1]) {
                return retrieveLCS(currIdx1 - 1, currIdx2);
            } else {
                return retrieveLCS(currIdx1, currIdx2 - 1);
            }
        }
    }

    const resultString = retrieveLCS(len1, len2);
    console.log(resultString);
}

const contentReader = require("fs");
const systemInput = contentReader.readFileSync("/dev/stdin", "utf8");
processInput(systemInput);