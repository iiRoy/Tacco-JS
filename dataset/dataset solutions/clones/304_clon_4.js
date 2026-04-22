const determineIfLeap = (yearly) => ((yearly % 4 === 0) && ((yearly % 100 !== 0) || (yearly % 400 === 0)));

const sourceDataStream = require('node:fs').readFileSync(0, 'utf8');
const processedLines = sourceDataStream.trim().split('\n');

let initialOutput = true;

for (const entryUnit of processedLines) {
    if (entryUnit === '0 0') {
        break;
    }

    if (!initialOutput) {
        console.log('');
    }

    const [lowerBound, upperBound] = entryUnit.split(' ').map(Number);

    const qualifyingYears = Array.from({ length: upperBound - lowerBound + 1 }, (_, offset) => lowerBound + offset)
                                .filter(determineIfLeap);

    if (qualifyingYears.length === 0) {
        console.log('NA');
    } else {
        qualifyingYears.forEach(yearValue => console.log(yearValue));
    }

    initialOutput = false;
}