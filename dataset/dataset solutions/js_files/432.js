const tokens = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\s+/);

const n = Number(tokens[0]);
const notes = tokens.slice(1, n + 1).map(Number);

let score = 0;
let combo = 0;
let previous = null;
let maximumCombo = 0;

for (let i = 0; i < n; i++) {
    const note = notes[i];

    if (note === previous) {
        combo++;
    } else {
        combo = 1;
    }

    score += note * combo;

    if (combo > maximumCombo) {
        maximumCombo = combo;
    }

    previous = note;
}

console.log(score);
console.log(maximumCombo);