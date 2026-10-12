const fs = require('fs');

const data = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const n = data[0];
const towerHeights = data.slice(1, n + 1);

let maximumArea = 0;

for (let left = 0; left < towerHeights.length; left++) {
    let minimumHeight = Infinity;

    for (
        let right = left;
        right < towerHeights.length;
        right++
    ) {
        minimumHeight = Math.min(
            minimumHeight,
            towerHeights[right]
        );

        const width = right - left + 1;
        const area = minimumHeight * width;

        maximumArea = Math.max(
            maximumArea,
            area
        );
    }
}

console.log(maximumArea);