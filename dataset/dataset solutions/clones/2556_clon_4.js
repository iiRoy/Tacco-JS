'use strict';

const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

const patternForbidEvenL = /^(?:.{2})*L/;

const patternForbidOddR = /^.(?:.{2})*R/;

const validationFailureDetected = patternForbidEvenL.test(dataStream) || patternForbidOddR.test(dataStream);

const finalVerdict = validationFailureDetected ? "No" : "Yes";

console.log(finalVerdict);