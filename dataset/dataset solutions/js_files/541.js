const fs = require('fs');

const data = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const n = data[0];
const signals = data.slice(1, n + 1);

const counts = new Map();
let dominantSignal = null;

for (const signal of signals) {
    const currentCount =
        (counts.get(signal) || 0) + 1;

    counts.set(signal, currentCount);

    if (currentCount > n / 2) {
        dominantSignal = signal;
        break;
    }
}

console.log(
    dominantSignal === null
        ? 'SIN FRECUENCIA DOMINANTE'
        : dominantSignal
);