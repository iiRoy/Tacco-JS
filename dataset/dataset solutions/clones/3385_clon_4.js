const inputSource = require('node:fs');

const dataBuffer = inputSource.readFileSync(process.stdin.fd, 'utf8');

const textualContent = dataBuffer.trim();

const tokenArray = textualContent.split(/\s+/g);

const numericUnits = tokenArray.map(itemString => +itemString);

const totalCount = numericUnits[0];

const numberSequence = numericUnits.slice(1, 1 + totalCount);

const foundOdd = numberSequence.some(elementValue => elementValue % 2 !== 0);

const outputChannel = process.stdout;

if (foundOdd) {
    outputChannel.write("first\n");
} else {
    outputChannel.write("second\n");
}