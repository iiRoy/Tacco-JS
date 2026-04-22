const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = rawData.trim().split("\n");

let matrix = [];
for (let i = 0; i < lines.length; i++) {
    const numericRow = lines[i].split(",").map(Number);
    matrix.push(numericRow);
}

matrix = matrix.slice(0, 9);

const totalLevels = matrix.length;
const splitPoint = (totalLevels - 1) / 2;

let cumulativeScores = Array(totalLevels);
for (let r = 0; r < totalLevels; r++) {
    cumulativeScores[r] = Array(matrix[r].length).fill(Number.MIN_SAFE_INTEGER);
}

cumulativeScores[0][0] = matrix[0][0];

for (let r = 0; r < totalLevels - 1; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
        const currentPathScore = cumulativeScores[r][c];

        if (currentPathScore === Number.MIN_SAFE_INTEGER) {
            continue;
        }

        if (r < splitPoint) {
            cumulativeScores[r+1][c] = Math.max(cumulativeScores[r+1][c], currentPathScore + matrix[r+1][c]);
            cumulativeScores[r+1][c+1] = Math.max(cumulativeScores[r+1][c+1], currentPathScore + matrix[r+1][c+1]);
        } else {
            if (c > 0) {
                cumulativeScores[r+1][c-1] = Math.max(cumulativeScores[r+1][c-1], currentPathScore + matrix[r+1][c-1]);
            }
            if (c < matrix[r].length - 1) {
                cumulativeScores[r+1][c] = Math.max(cumulativeScores[r+1][c], currentPathScore + matrix[r+1][c]);
            }
        }
    }
}

let peakScore = 0;
const finalRowScores = cumulativeScores[totalLevels - 1];
for (let i = 0; i < finalRowScores.length; i++) {
    if (finalRowScores[i] !== Number.MIN_SAFE_INTEGER) {
        peakScore = Math.max(peakScore, finalRowScores[i]);
    }
}

console.log(peakScore);