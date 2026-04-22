'use strict';

function processInputString(incomingText) {
  const characterTransformer = new Map([
    ['1', '9']
  ]);

  const individualChars = incomingText.split('');

  const outputChars = individualChars.map(singleChar => {
    return characterTransformer.has(singleChar) ? characterTransformer.get(singleChar) : '1';
  });

  const finalOutput = outputChars.join('');
  console.log(finalOutput);
}

const fileOperations = require('fs');
const sourceDataContent = fileOperations.readFileSync('/dev/stdin', 'utf8');

processInputString(sourceDataContent);