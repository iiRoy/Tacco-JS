const fs = require('fs');

function readSpellBook() {
    const values = fs
        .readFileSync(0, 'utf8')
        .trim()
        .split(/\s+/)
        .map(Number);

    const totalSpells = values.shift();
    const totalRules = values.shift();

    const requirements = Array.from(
        { length: totalSpells + 1 },
        () => []
    );

    let rulesRead = 0;

    while (rulesRead < totalRules) {
        const sourceSpell = values.shift();
        const destinationSpell = values.shift();

        requirements[sourceSpell].push(destinationSpell);
        rulesRead++;
    }

    return {
        totalSpells,
        requirements,
    };
}

function inspectSpell(
    currentSpell,
    requirements,
    activePath,
    completedSpells
) {
    if (activePath.has(currentSpell)) {
        return true;
    }

    if (completedSpells.has(currentSpell)) {
        return false;
    }

    activePath.add(currentSpell);

    for (const nextSpell of requirements[currentSpell]) {
        const contradiction = inspectSpell(
            nextSpell,
            requirements,
            activePath,
            completedSpells
        );

        if (contradiction) {
            return true;
        }
    }

    activePath.delete(currentSpell);
    completedSpells.add(currentSpell);

    return false;
}

const spellBook = readSpellBook();

const currentInvocation = new Set();
const resolvedInvocations = new Set();

let contradictionFound = false;
let spellIdentifier = 1;

while (spellIdentifier <= spellBook.totalSpells) {
    if (
        inspectSpell(
            spellIdentifier,
            spellBook.requirements,
            currentInvocation,
            resolvedInvocations
        )
    ) {
        contradictionFound = true;
        break;
    }

    spellIdentifier++;
}

process.stdout.write(
    contradictionFound
        ? 'PARADOJA DETECTADA\n'
        : 'SISTEMA ARCANO ESTABLE\n'
);