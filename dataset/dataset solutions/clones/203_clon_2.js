var utilityModule = require('util');

function processInputData() {
  receivedText.forEach(function(currentLine) {
    utilityModule.print(currentLine.replace(/apple|peach/g, function(wordMatch) {
      return wordMatch === 'apple' ? 'peach' : 'apple';
    }));
  });
}

var receivedText = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataSegment) {
  receivedText += dataSegment;
});
process.stdin.on('end', function() {
  receivedText = receivedText.split('\n');
  processInputData();
});
process.stdin.on('end', function() {
  receivedText = receivedText.split('\n');
  processInputData();
});
