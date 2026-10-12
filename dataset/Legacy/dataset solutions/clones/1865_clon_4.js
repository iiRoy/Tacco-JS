const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const [positiveCount, neutralCount, negativeCount, drawCount] = rawData.split(" ").map(Number);

const negativeCardsTaken = Math.max(0, drawCount - (positiveCount + neutralCount));

const finalScore = positiveCount - negativeCardsTaken;

console.log(finalScore);
