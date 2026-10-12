const fs = require('fs');

function readScrolls() {
    const content = fs.readFileSync(0, 'utf8');
    const rows = content.split(/\r?\n/);

    return [
        rows[0] || '',
        rows[1] || '',
    ];
}

function extractSortedRunes(scroll) {
    const cleanText = scroll
        .toLowerCase()
        .replace(/[^a-z]/g, '');

    return [...cleanText].sort();
}

function containSameSpell(leftScroll, rightScroll) {
    const leftRunes = extractSortedRunes(leftScroll);
    const rightRunes = extractSortedRunes(rightScroll);

    if (leftRunes.length !== rightRunes.length) {
        return false;
    }

    while (leftRunes.length > 0) {
        const leftRune = leftRunes.pop();
        const rightRune = rightRunes.pop();

        if (leftRune !== rightRune) {
            return false;
        }
    }

    return true;
}

const [originalScroll, candidateScroll] = readScrolls();

if (!containSameSpell(originalScroll, candidateScroll)) {
    console.log('HECHIZOS DISTINTOS');
} else {
    console.log('MISMO HECHIZO');
}