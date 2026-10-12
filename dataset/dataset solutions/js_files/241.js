const fs = require('fs');

const data = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const target = data[0];
const signals = data.slice(1);
let answer = null;

for (let i = 0; i < signals.length; i++) {
    for (let j = i + 1; j < signals.length; j++) {
        if (signals[i] + signals[j] === target) {
            answer = [i + 1, j + 1];
            break;
        }
    }

    if (answer) {
        break;
    }
}

console.log(
    answer
        ? answer.join(' ')
        : 'SIN COINCIDENCIA'
);