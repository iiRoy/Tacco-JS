const fileSystem = require('node:fs');
const standardOutput = process.stdout;

const entireInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const inputSequences = entireInputContent.split('\n');
const primarySequence = inputSequences[0];

const numericTokens = primarySequence ? primarySequence.split(' ') : [''];

const firstValueToken = numericTokens[0];
const thirdValueToken = numericTokens[2];

const firstNumericElement = Number(firstValueToken);
const thirdNumericElement = Number(thirdValueToken);

const calculatedOutcome = firstNumericElement + thirdNumericElement / 2;

standardOutput.write(calculatedOutcome.toString() + '\n');