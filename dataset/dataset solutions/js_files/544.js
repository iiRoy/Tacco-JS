const fs = require('fs');

const tokens = fs
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/);

const n = Number(tokens[0]);
const codes = tokens.slice(1, n + 1);

let commonPrefix = codes[0] || '';

for (let i = 1; i < codes.length; i++) {
    while (!codes[i].startsWith(commonPrefix)) {
        commonPrefix = commonPrefix.slice(0, -1);
    }

    if (commonPrefix === '') {
        break;
    }
}

console.log(
    commonPrefix === ''
        ? 'SIN PREFIJO'
        : commonPrefix
);