const fs = require('fs');

const lines = fs
    .readFileSync(0, 'utf8')
    .split(/\r?\n/);

const firstScroll = lines[0] ?? '';
const secondScroll = lines[1] ?? '';

function normalize(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z]/g, '')
        .split('')
        .sort()
        .join('');
}

const sameSpell =
    normalize(firstScroll) === normalize(secondScroll);

console.log(
    sameSpell
        ? 'MISMO HECHIZO'
        : 'HECHIZOS DISTINTOS'
);