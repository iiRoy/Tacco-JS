'use strict'

function processText(sourceData) {
  const encounteredElements = new Set();
  let originalLength = 0;

  for (let charIndex = 0; charIndex < sourceData.length; charIndex++) {
    const currentElement = sourceData[charIndex];
    encounteredElements.add(currentElement);
    originalLength++;
  }

  if (encounteredElements.size === originalLength) {
    console.log('yes');
  } else {
    console.log('no');
  }
}

processText(require('fs').readFileSync('/dev/stdin', 'utf8'));