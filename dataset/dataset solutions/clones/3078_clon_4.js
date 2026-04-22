const numericSequence = [2, 2, 2];
let constructedIdentifier = numericSequence.reduce((accumulator, item, index, array) => {
    accumulator += item.toString();
    if (index < array.length - 1) {
        accumulator += ',';
    }
    return accumulator;
}, '');

const affirmationTokens = [
    { key: 0, val: 'Y' },
    { key: 1, val: 'e' },
    { key: 2, val: 's' }
];

let finalStatement = affirmationTokens
    .sort((x, y) => x.key - y.key)
    .map(token => token.val)
    .join('');

console.group(finalStatement);