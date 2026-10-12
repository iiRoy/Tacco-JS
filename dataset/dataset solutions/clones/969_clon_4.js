const fs = require('fs');

const transmission = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/);

const engravedSequence = transmission.shift();
const unlockingRunes = transmission.shift();

const runeQuota = new Map();

for (const rune of unlockingRunes) {
    runeQuota.set(
        rune,
        (runeQuota.get(rune) || 0) + 1
    );
}

const windowRunes = new Map();

let fulfilledRuneTypes = 0;
let leftEdge = 0;
let smallestWindow = Infinity;

for (
    let rightEdge = 0;
    rightEdge < engravedSequence.length;
    rightEdge++
) {
    const enteringRune = engravedSequence[rightEdge];

    if (runeQuota.has(enteringRune)) {
        const newAmount =
            (windowRunes.get(enteringRune) || 0) + 1;

        windowRunes.set(enteringRune, newAmount);

        if (newAmount === runeQuota.get(enteringRune)) {
            fulfilledRuneTypes++;
        }
    }

    while (fulfilledRuneTypes === runeQuota.size) {
        smallestWindow = Math.min(
            smallestWindow,
            rightEdge - leftEdge + 1
        );

        const leavingRune = engravedSequence[leftEdge];

        if (runeQuota.has(leavingRune)) {
            const currentAmount =
                windowRunes.get(leavingRune);

            if (currentAmount === runeQuota.get(leavingRune)) {
                fulfilledRuneTypes--;
            }

            windowRunes.set(
                leavingRune,
                currentAmount - 1
            );
        }

        leftEdge++;
    }
}

console.log(
    smallestWindow === Infinity
        ? 'SIN FRAGMENTO'
        : smallestWindow
);