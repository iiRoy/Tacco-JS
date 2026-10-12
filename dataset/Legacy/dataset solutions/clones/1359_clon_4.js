"use strict";
const fileSystemModule = require('fs');
const rawContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const dataSegments = rawContent.split(" ");

const primaryValue = dataSegments[0];
const secondaryValue = dataSegments[1];

const comparisonOutcome = (primaryValue === secondaryValue)
    ? 'a == b'
    : (primaryValue > secondaryValue)
        ? 'a > b'
        : 'a < b';

console.log(comparisonOutcome);
