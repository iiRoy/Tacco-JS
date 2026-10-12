const fs = require('fs');

const data = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const n = data[0];
const maximumDistance = data[1];
const signals = data.slice(2, n + 2);

let temporalEcho = false;

for (let i = 0; i < signals.length; i++) {
    for (
        let j = i + 1;
        j < signals.length && j - i <= maximumDistance;
        j++
    ) {
        if (signals[i] === signals[j]) {
            temporalEcho = true;
            break;
        }
    }

    if (temporalEcho) {
        break;
    }
}

console.log(
    temporalEcho
        ? 'ECO TEMPORAL'
        : 'LÍNEA TEMPORAL ESTABLE'
);