const fs = require('fs');

const manuscripts = fs
    .readFileSync(0, 'utf8')
    .split(/\r?\n/);

const runeBalance = new Int32Array(26);

function updateRuneBalance(message, variation) {
    for (const symbol of message.toLowerCase()) {
        const runeCode = symbol.charCodeAt(0) - 97;

        if (runeCode >= 0 && runeCode < 26) {
            runeBalance[runeCode] += variation;
        }
    }
}

updateRuneBalance(manuscripts[0] || '', 1);
updateRuneBalance(manuscripts[1] || '', -1);

let spellIsEquivalent = true;

for (const remainingRunes of runeBalance) {
    if (remainingRunes !== 0) {
        spellIsEquivalent = false;
        break;
    }
}

process.stdout.write(
    spellIsEquivalent
        ? 'MISMO HECHIZO\n'
        : 'HECHIZOS DISTINTOS\n'
);