function processUserInput(rawString) {
  const cleanedString = rawString.replace(/^\s+|\s+$/g, '');
  const mathematicalExpression = cleanedString.replace(/\s+/g, '+');

  let computedValue;
  try {
    computedValue = eval(mathematicalExpression);
  } catch (err) {
    computedValue = NaN;
  }

  const resultLookup = new Map();
  resultLookup.set(true, String(computedValue));
  resultLookup.set(false, "error");

  return resultLookup.get(computedValue < 10);
}

const fileAccessModule = require('node:fs');
const acquiredBuffer = fileAccessModule.readFileSync('/dev/stdin');
const contentRetrieved = acquiredBuffer.toString('utf8');

global.console.log(processUserInput(contentRetrieved));