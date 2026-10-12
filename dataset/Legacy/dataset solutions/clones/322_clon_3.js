var accumulatedInputData = '';

const TARGET_SUBSTRING = 'Hoshino';
const REPLACEMENT_SUBSTRING = 'Hoshina';

function applyStringTransformation(sourceText, searchPattern, replaceWith) {
  return sourceText.replace(searchPattern, replaceWith);
}

function handleDataChunk(incomingDataChunk) {
  accumulatedInputData += incomingDataChunk;
}

function finalizeInputProcessing() {
  const transformedResult = applyStringTransformation(
    accumulatedInputData,
    TARGET_SUBSTRING,
    REPLACEMENT_SUBSTRING
  );
  console.log(transformedResult);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', handleDataChunk);
process.stdin.on('end', finalizeInputProcessing);
