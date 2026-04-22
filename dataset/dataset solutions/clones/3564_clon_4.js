const fileAccess = require('node:fs');
const systemPath = '/dev/stdin';

const rawContent = fileAccess.readFileSync(systemPath, 'utf8').trim();

const numericInput = +rawContent;

const quotient = numericInput / 2;
const lowerPart = Math.floor(quotient);
const upperPart = Math.ceil(quotient);

const finalOutcome = lowerPart * upperPart;

globalThis.process.stdout.write(String(finalOutcome) + '\n');