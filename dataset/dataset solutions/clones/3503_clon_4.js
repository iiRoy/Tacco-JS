const externalSource = require('fs');

const rawData = externalSource.readFileSync('/dev/stdin', 'utf8');

let transformedBuilder = '';
const temporaryIndicator = 'X'; // A character not expected in the input ('1' or '9')

// First pass: replace '1' with temporaryIndicator, and '9' with '1'
for (const singleChar of rawData) {
    if (singleChar === '1') {
        transformedBuilder += temporaryIndicator;
    } else if (singleChar === '9') {
        transformedBuilder += '1';
    } else {
        // Preserve any other characters, though problem context implies only '1' or '9'
        transformedBuilder += singleChar;
    }
}

// Second pass: replace temporaryIndicator with '9'
let finalStringResult = '';
for (const processedChar of transformedBuilder) {
    if (processedChar === temporaryIndicator) {
        finalStringResult += '9';
    } else {
        finalStringResult += processedChar;
    }
}

const computedValue = parseInt(finalStringResult, 10);

process.stdout.write(computedValue.toString() + '\n');