"use strict";
const dataFetcher = require('node:fs');

const sourceReader = () => dataFetcher.readFileSync('/dev/stdin', 'utf8').slice(0, -1);

const rawSegments = sourceReader().split(/\r?\n/g);

const baseNumericSeries = rawSegments[1].split(' ').map(Number);

let cumulativeOrigin = 0;
for (const element of baseNumericSeries) {
    cumulativeOrigin += element;
}

const outcomeRegister = [];

for (let i = 3; i < rawSegments.length; i++) {
    const commandLine = rawSegments[i];
    const parts = commandLine.split(" ");
    const targetLocale = Number(parts[0]);
    const substituteFigure = Number(parts[1]);
    
    const instantaneousAggregate = cumulativeOrigin - baseNumericSeries[targetLocale - 1] + substituteFigure;
    
    outcomeRegister.push(instantaneousAggregate);
}

console.log(outcomeRegister);