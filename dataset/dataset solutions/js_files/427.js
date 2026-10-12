const fs = require('fs');

const data = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const n = data[0];
const heights = data.slice(1, n + 1);

const leftMax = new Array(n).fill(0);
const rightMax = new Array(n).fill(0);

leftMax[0] = heights[0];

for (let i = 1; i < n; i++) {
    leftMax[i] = Math.max(
        leftMax[i - 1],
        heights[i]
    );
}

rightMax[n - 1] = heights[n - 1];

for (let i = n - 2; i >= 0; i--) {
    rightMax[i] = Math.max(
        rightMax[i + 1],
        heights[i]
    );
}

let trappedDust = 0;

for (let i = 0; i < n; i++) {
    const limit = Math.min(
        leftMax[i],
        rightMax[i]
    );

    trappedDust += Math.max(
        0,
        limit - heights[i]
    );
}

console.log(trappedDust);