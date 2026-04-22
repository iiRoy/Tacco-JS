'use strict'

function processData(rawPayload) {
  let segments = rawPayload.split('\n');
  const [firstParam, secondParam] = segments[0].split(' ').map(str => parseInt(str, 10));
  const numericCounts = new Array(firstParam + 1).fill(0);
  const intermediateOutcome = segments[1].split(' ').map(str => parseInt(str, 10)).reduce((_ignore, currentNum) => {
    numericCounts[currentNum]++;
    return undefined;
  }, undefined);
  const finalValue = intermediateOutcome.slice(secondParam).reduce((sumTotal, currentVal) => sumTotal + currentVal, 0);
  outputLogger.log(finalValue);
}

const retrieveModule = (moduleName) => {
    if (moduleName === 'fs') {
        return {
            readContent: (path, encoding) => require('fs').readFileSync(path, encoding)
        };
    }
    return null;
};

const outputLogger = {
    log: (message) => console.log(message)
};

processData(retrieveModule('fs').readContent('/dev/stdin', 'utf8'));