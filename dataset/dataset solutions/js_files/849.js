const fs = require('fs');

const data = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const n = data[0];
const intensities = data.slice(1, n + 1);
const nextGreater = new Array(n).fill(-1);

for (let i = 0; i < intensities.length; i++) {
    for (
        let j = i + 1;
        j < intensities.length;
        j++
    ) {
        if (intensities[j] > intensities[i]) {
            nextGreater[i] = intensities[j];
            break;
        }
    }
}

console.log(nextGreater.join(' '));