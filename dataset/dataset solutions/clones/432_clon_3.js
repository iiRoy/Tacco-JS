const tokens = require("fs")
    .readFileSync(0, "utf8")
    .trim()
    .split(/\s+/);

const n = Number(tokens[0]);
const notes = tokens.slice(1, n + 1).map(Number);

function calculateNextCombo(currentCombo, isRepeated) {
    return isRepeated ? currentCombo + 1 : 1;
}

let score = 0;
let combo = 0;
let maximumCombo = 0;
const comboHistory = [];

for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    const repeatsPrevious =
        i > 0 && note === notes[i - 1];

    combo = calculateNextCombo(combo, repeatsPrevious);
    comboHistory.push(combo);

    const generatedEnergy = note * combo;
    score = score + generatedEnergy;

    maximumCombo = Math.max(maximumCombo, combo);
}

console.log(`${score}\n${maximumCombo}`);