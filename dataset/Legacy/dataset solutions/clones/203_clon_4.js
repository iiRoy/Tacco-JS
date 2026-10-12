const process = require('process');

const wordExchangeMap = new Map([
  ['apple', 'peach'],
  ['peach', 'apple']
]);

const targetPhrases = Array.from(wordExchangeMap.keys());

function processTextSegment(sourceString) {
  let transformedSegment = '';
  let currentOffset = 0;
  const sourceLength = sourceString.length;

  while (currentOffset < sourceLength) {
    let matchFoundInSegment = false;
    for (const phrase of targetPhrases) {
      if (sourceString.substring(currentOffset, currentOffset + phrase.length) === phrase) {
        transformedSegment += wordExchangeMap.get(phrase);
        currentOffset += phrase.length;
        matchFoundInSegment = true;
        break;
      }
    }
    if (!matchFoundInSegment) {
      transformedSegment += sourceString[currentOffset];
      currentOffset++;
    }
  }
  return transformedSegment;
}

async function executeTransformation() {
  let accumulatedInputData = '';

  process.stdin.setEncoding('utf8');

  for await (const chunk of process.stdin) {
    accumulatedInputData += chunk;
  }

  const sourceLines = accumulatedInputData.split('\n');

  const modifiedLines = sourceLines.map(processTextSegment);

  for (const outputLine of modifiedLines) {
    process.stdout.write(outputLine);
  }
}

executeTransformation();
