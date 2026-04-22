const acquiredData = require('node:fs').readFileSync(0, 'utf8');
const numericalFragments = acquiredData.trim().match(/\d+/g);

const firstOperand = Number(numericalFragments[0]);
const secondOperand = Number(numericalFragments[1]);

const finalCount = Math.ceil((secondOperand + 1) / firstOperand);

process.stdout.write(finalCount.toString());