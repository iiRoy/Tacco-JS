'use strict';

function processData(rawData) {
    const parsedSegments = rawData.trim().split('\n');

    const _ignoreCount = parseInt(parsedSegments.shift(), 10);

    const initialLetterCounts = new Map([
        ['M', 0],
        ['A', 0],
        ['R', 0],
        ['C', 0],
        ['H', 0]
    ]);

    for (const currentLine of parsedSegments) {
        const firstGlyph = currentLine[0];
        if (initialLetterCounts.has(firstGlyph)) {
            initialLetterCounts.set(firstGlyph, initialLetterCounts.get(firstGlyph) + 1);
        }
    }

    const numericalValues = [
        initialLetterCounts.get('M'),
        initialLetterCounts.get('A'),
        initialLetterCounts.get('R'),
        initialLetterCounts.get('C'),
        initialLetterCounts.get('H')
    ];

    let cumulativeProductSum = 0;

    for (let indexA = 0; indexA < numericalValues.length; indexA++) {
        for (let indexB = indexA + 1; indexB < numericalValues.length; indexB++) {
            for (let indexC = indexB + 1; indexC < numericalValues.length; indexC++) {
                const valA = numericalValues[indexA];
                const valB = numericalValues[indexB];
                const valC = numericalValues[indexC];
                cumulativeProductSum += (valA * valB * valC);
            }
        }
    }

    console.log(cumulativeProductSum);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));