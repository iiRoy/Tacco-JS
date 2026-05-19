const rawData = require('node:fs').readFileSync('/dev/stdin', 'utf8');

let lineData = rawData.trim().replace(/W/g, '0').replace(/B/g, '1').replace(/R/g, '2').split('\n');

const dimensions = lineData.shift().split(' ').map(Number);

const rows = dimensions[0];
const cols = dimensions[1];

const colorCountsPerRow = lineData.map(function(rowString) {
    let rowColorDeficit = [cols, cols, cols];
    for (let charIndex = 0; charIndex < cols; charIndex++) {
        rowColorDeficit[parseInt(rowString[charIndex], 10)]--;
    }
    return rowColorDeficit;
});

let minimumCost = 2500;

for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    for (let splitPoint1 = 0; splitPoint1 < rows; splitPoint1++) {
        let sectionFlags = [0, 0, 0];
        let currentCost = 0;
        let currentRow = 0;

        while (currentRow < rowIndex) {
            sectionFlags[0] = 1;
            currentCost += colorCountsPerRow[currentRow][0];
            currentRow++;
        }

        while (currentRow < splitPoint1) {
            sectionFlags[1] = 1;
            currentCost += colorCountsPerRow[currentRow][1];
            currentRow++;
        }

        while (currentRow < rows) {
            sectionFlags[2] = 1;
            currentCost += colorCountsPerRow[currentRow][2];
            currentRow++;
        }

        if (sectionFlags[0] + sectionFlags[1] + sectionFlags[2] === 3) {
            minimumCost = Math.min(currentCost, minimumCost);
        }
    }
}

console.log(minimumCost);
