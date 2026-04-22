function processAndTransform(inputData) {
  'use strict';

  const sourceRepresentation = `${inputData}`;
  const resultingBuffer = [];
  let currentPosition = 0;
  const limit = sourceRepresentation.length;

  while (currentPosition < limit) {
    const charValue = sourceRepresentation.charCodeAt(currentPosition);

    if (charValue === 92) { // ASCII for '\'
      resultingBuffer.push('\\\\');
    } else if (charValue === 39) { // ASCII for '''
      resultingBuffer.push('\\\'');
    } else {
      resultingBuffer.push(sourceRepresentation[currentPosition]);
    }
    currentPosition++;
  }

  return resultingBuffer.join('');
}

module.exports = processAndTransform;