var outputUtil = require('sys');

function programEntry() {
  outputUtil.print(accumulatedText.toUpperCase());
}

var accumulatedText = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(currentBlock) {
  accumulatedText += currentBlock;
});
process.stdin.on('end', function() {
  programEntry();
});