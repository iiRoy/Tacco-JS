const initialPayload = require('node:fs').readFileSync(0, 'utf8');
const componentStrings = initialPayload.trim().split(/\s+/);

const firstNumeric = Number(componentStrings[0]);
const secondNumeric = Number(componentStrings[1]);
const thirdNumeric = Number(componentStrings[2]);

const behaviorMap = new Map();
behaviorMap.set(1, (paramA, paramB) => "Hello World");
behaviorMap.set('default', (paramA, paramB) => paramA + paramB);

let finalOutcome;
if (behaviorMap.has(secondNumeric)) {
  finalOutcome = behaviorMap.get(secondNumeric)(secondNumeric, thirdNumeric);
} else {
  finalOutcome = behaviorMap.get('default')(secondNumeric, thirdNumeric);
}

process.stdout.write(String(finalOutcome) + '\n');