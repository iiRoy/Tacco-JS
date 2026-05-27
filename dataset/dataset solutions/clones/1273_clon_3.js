var receivedInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(inputChunk) {
  receivedInputBuffer += inputChunk;
});

process.stdin.on('end', function() {
  receivedInputBuffer = receivedInputBuffer.split('\n');
  performWordReversalAndOutput();
});

function performWordReversalAndOutput() {
  const WORD_DELIMITER_CHARACTER = ' '; 

  const targetLineForManipulation = receivedInputBuffer[1];

  const individualWordsArray = targetLineForManipulation.split(WORD_DELIMITER_CHARACTER);

  individualWordsArray.reverse();

  const finalReversedSentence = individualWordsArray.join(WORD_DELIMITER_CHARACTER);

  console.log(finalReversedSentence);
}
