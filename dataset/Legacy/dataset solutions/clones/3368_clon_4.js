process.stdin.resume();
process.stdin.setEncoding('utf8');

let allInputBuffer = '';
process.stdin.on('data', function(currentChunk) {
    allInputBuffer += currentChunk;
});
process.stdin.on('end', function() {
    processData(allInputBuffer.split(/\r?\n/));
});

function processData(inputLines){
  const combinedContent = inputLines.join('');
  const twoOccurrences = Array.from(combinedContent).filter(characterUnit => characterUnit === '2');
  console.log(twoOccurrences.length);
}
