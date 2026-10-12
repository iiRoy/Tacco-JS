const fs = require('fs');

const input = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/);

const inscription = input[0];
const key = input[1];

const required = new Map();

for (const rune of key) {
    required.set(
        rune,
        (required.get(rune) || 0) + 1
    );
}

let minimumLength = Infinity;

for (let start = 0; start < inscription.length; start++) {
    const found = new Map();

    for (
        let end = start;
        end < inscription.length;
        end++
    ) {
        const rune = inscription[end];

        found.set(
            rune,
            (found.get(rune) || 0) + 1
        );

        let containsKey = true;

        for (const [requiredRune, amount] of required) {
            if ((found.get(requiredRune) || 0) < amount) {
                containsKey = false;
                break;
            }
        }

        if (containsKey) {
            minimumLength = Math.min(
                minimumLength,
                end - start + 1
            );

            break;
        }
    }
}

console.log(
    minimumLength === Infinity
        ? 'SIN FRAGMENTO'
        : minimumLength
);