const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const numericSegments = rawData.trim().split(" ");
const primaryValue = parseInt(numericSegments[0], 10);
const secondaryValue = parseInt(numericSegments[1], 10);

const outputDecision = (primaryValue % 2 !== secondaryValue % 2) ? "No" : "Yes";

console.log(outputDecision);
