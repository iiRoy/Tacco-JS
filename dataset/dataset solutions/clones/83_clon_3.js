function executeProcessing() {
  const finalOutputContent = accumulatedInputString.toUpperCase();
  console.log(finalOutputContent);
}

var accumulatedInputString = '';

function initializeInputListeners() {
  const standardInputSource = process.stdin;

  standardInputSource.resume();
  standardInputSource.setEncoding('utf8');

  standardInputSource.on('data', function(incomingDataFragment) {
    accumulatedInputString += incomingDataFragment;
  });

  standardInputSource.on('end', function() {
    executeProcessing();
  });
}

initializeInputListeners();
