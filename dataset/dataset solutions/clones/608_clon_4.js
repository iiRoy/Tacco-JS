const sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const processedString = sourceData.trim();

let greatestCountOfO = 0;

for (let currentOffset = 0; currentOffset <= processedString.length; ++currentOffset) {
    let jBlockLength = 0;
    let oBlockLength = 0;
    let iBlockLength = 0;

    let scanOffset = currentOffset;

    while (scanOffset < processedString.length && processedString.charAt(scanOffset) === 'J') {
        jBlockLength++;
        scanOffset++;
    }

    while (scanOffset < processedString.length && processedString.charAt(scanOffset) === 'O') {
        oBlockLength++;
        scanOffset++;
    }

    while (scanOffset < processedString.length && processedString.charAt(scanOffset) === 'I') {
        iBlockLength++;
        scanOffset++;
    }

    if (jBlockLength >= oBlockLength && iBlockLength >= oBlockLength) {
        greatestCountOfO = Math.max(greatestCountOfO, oBlockLength);
    }
}

console.log(greatestCountOfO);