function findMinimum(...values) {
    return Math.min(...values);
}

function computeStringDistance(firstString, secondString) {
    const len1 = firstString.length;
    const len2 = secondString.length;

    const distMatrix = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

    for (let r = 0; r <= len1; r++) {
        distMatrix[r][0] = r;
    }

    for (let c = 0; c <= len2; c++) {
        distMatrix[0][c] = c;
    }

    for (let r = 1; r <= len1; r++) {
        for (let c = 1; c <= len2; c++) {
            const charFromFirst = firstString.charAt(r - 1);
            const charFromSecond = secondString.charAt(c - 1);

            const deletionCost = distMatrix[r - 1][c] + 1;
            const insertionCost = distMatrix[r][c - 1] + 1;
            const diagonalValue = distMatrix[r - 1][c - 1];

            if (charFromFirst === charFromSecond) {
                distMatrix[r][c] = findMinimum(deletionCost, insertionCost);
            } else {
                distMatrix[r][c] = findMinimum(deletionCost, insertionCost, diagonalValue);
            }
        }
    }
    return distMatrix[len1][len2];
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = fileContent.split('\n');

console.log(computeStringDistance(lines[0], lines[1]));
