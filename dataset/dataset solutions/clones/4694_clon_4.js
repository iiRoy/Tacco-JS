'use strict';

const fileSystemUtility = require('node:fs');

const rawInputContent = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');
const requestedNumber = Number(rawInputContent.split('\n')[0].trim());

const primeModulo = (1000000000 + 7);

const finalResult = Array.from({ length: requestedNumber }, (_, index) => index + 1)
  .reduce((accumulator, currentValue) => {
    return (accumulator * currentValue) % primeModulo;
  }, 1);

process.stdout.write(String(finalResult) + '\n');