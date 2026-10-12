const fs = require('fs');

function loadArchaeologicalData() {
    const values = fs
        .readFileSync(0, 'utf8')
        .trim()
        .split(/\s+/);

    return {
        text: values[0],
        keyRunes: values[1],
    };
}

function createRuneRequirements(keyRunes) {
    const requirements = new Map();

    for (const rune of keyRunes) {
        const previousAmount =
            requirements.get(rune) || 0;

        requirements.set(rune, previousAmount + 1);
    }

    return requirements;
}

function fragmentLengthFrom(text, origin, requirements) {
    const collected = new Map();

    let satisfiedRuneTypes = 0;
    let position = origin;

    while (position < text.length) {
        const currentRune = text[position];

        if (requirements.has(currentRune)) {
            const newAmount =
                (collected.get(currentRune) || 0) + 1;

            collected.set(currentRune, newAmount);

            if (
                newAmount === requirements.get(currentRune)
            ) {
                satisfiedRuneTypes++;
            }
        }

        if (satisfiedRuneTypes === requirements.size) {
            return position - origin + 1;
        }

        position++;
    }

    return Infinity;
}

const archaeologicalData = loadArchaeologicalData();

const runeRequirements = createRuneRequirements(
    archaeologicalData.keyRunes
);

let bestFragmentSize = Infinity;

for (
    let origin = 0;
    origin < archaeologicalData.text.length;
    origin++
) {
    const candidateSize = fragmentLengthFrom(
        archaeologicalData.text,
        origin,
        runeRequirements
    );

    bestFragmentSize = Math.min(
        bestFragmentSize,
        candidateSize
    );
}

process.stdout.write(
    bestFragmentSize === Infinity
        ? 'SIN FRAGMENTO\n'
        : `${bestFragmentSize}\n`
);