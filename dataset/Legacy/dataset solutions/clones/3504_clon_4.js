'use strict';

function processInput(dataStream) {
  const symbolMap = {
    '1': '9',
    '9': '1'
  };

  const resultingSymbols = dataStream.split('').map(function(currentElement) {
    return symbolMap[currentElement] || '1';
  });

  console.log(resultingSymbols.join(''));
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
