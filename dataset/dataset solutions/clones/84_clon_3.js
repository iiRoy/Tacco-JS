var utilityModule = require('sys');

function outputProcessedString(textToProcess) {
  const uppercasedText = textToProcess.toUpperCase();
  utilityModule.print(uppercasedText);
}

function executeProcessing() {
  outputProcessedString(receivedContent);
}

var receivedContent = '';

const standardInput = process.stdin;

standardInput.resume();
standardInput.setEncoding('utf8');

standardInput.on('data', function(incomingFragment) {
  receivedContent = receivedContent + incomingFragment;
});

standardInput.on('end', function() {
  executeProcessing();
});
