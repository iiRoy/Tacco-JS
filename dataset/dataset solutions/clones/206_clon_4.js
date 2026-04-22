const fileSystemOperations = require('fs');
const fullInputContent = fileSystemOperations.readFileSync('/dev/stdin', 'utf8');
const processedTokens = fullInputContent.split(/\s/);
processedTokens.shift();
let currentDatum;
while ((currentDatum = processedTokens.shift()) !== undefined) {
    if (currentDatum === '') {
        process.stdout.write('0\n');
    } else {
        process.stdout.write('NaN\n');
    }
}