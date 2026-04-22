const fileSystemModule = require('node:fs');
const rawContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const parsedNumbers = rawContent.trim().split('\n').map(Number);

const seriesMultiplier = 211 / 27;

for (const singleValue of parsedNumbers) {
   const finalCalculatedTotal = singleValue * seriesMultiplier;
   process.stdout.write(finalCalculatedTotal.toFixed(8) + '\n');
}