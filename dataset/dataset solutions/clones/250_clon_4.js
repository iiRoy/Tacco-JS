const fileSystemUtility = require('node:fs');
let accumulator = 0;
const rawDataSource = fileSystemUtility.readFileSync(0);
const textContent = rawDataSource.toString('utf8');

let numberSegment = '';

for (let currentPosition = 0; currentPosition < textContent.length; currentPosition++) {
    const characterUnit = textContent[currentPosition];
    if (characterUnit >= '0' && characterUnit <= '9') {
        numberSegment += characterUnit;
    } else {
        if (numberSegment.length > 0) {
            accumulator += Number(numberSegment);
            numberSegment = '';
        }
    }
}

if (numberSegment.length > 0) {
    accumulator += Number(numberSegment);
}

process.stdout.write(accumulator.toString() + '\n');