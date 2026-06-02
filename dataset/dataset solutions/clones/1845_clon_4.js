'use strict';
const displayMessage = (content) => console.log(content);

function processInputData(sourceData) {
  const fullLine = sourceData[0].trim();
  const lastCharValue = fullLine.slice(-1);

  const outcomeRegistry = new Map([
    ['3', 'bon'],
    ['0', 'pon'],
    ['1', 'pon'],
    ['6', 'pon'],
    ['8', 'pon']
  ]);

  const finalOutcome = outcomeRegistry.get(lastCharValue) || 'hon';
  
  displayMessage(finalOutcome);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
