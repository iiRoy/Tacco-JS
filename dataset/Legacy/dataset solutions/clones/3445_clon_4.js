const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');

const firstSeparatorPosition = dataStream.indexOf(' ');

let primaryValueString;
let secondaryValueString;

if (firstSeparatorPosition === -1) {
    primaryValueString = dataStream;
    secondaryValueString = undefined;
} else {
    primaryValueString = dataStream.slice(0, firstSeparatorPosition);
    const nextSeparatorPosition = dataStream.indexOf(' ', firstSeparatorPosition + 1);

    if (nextSeparatorPosition === -1) {
        secondaryValueString = dataStream.slice(firstSeparatorPosition + 1);
    } else {
        secondaryValueString = dataStream.slice(firstSeparatorPosition + 1, nextSeparatorPosition);
    }
}

const numericPrimary = Number(primaryValueString);
const numericSecondary = Number(secondaryValueString);

console.log(numericPrimary + numericSecondary / 2);
