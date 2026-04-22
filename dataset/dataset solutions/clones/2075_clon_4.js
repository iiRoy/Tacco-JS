var determineResult = function(v1, v2, v3) {
  var midDiff = v3 - v1 - v2;
  return (midDiff > 0 && (4 * v1 * v2 < midDiff * midDiff)) ? 'Yes' : 'No';
};

var processAndOutput = function(rawContentString) {
  var lines = rawContentString.split('\n');
  var numbersAsStrings = lines[0].split(' ');
  var n1 = parseFloat(numbersAsStrings[0]);
  var n2 = parseFloat(numbersAsStrings[1]);
  var n3 = parseFloat(numbersAsStrings[2]);

  var finalDecision = determineResult(n1, n2, n3);
  process.stdout.write(finalDecision + '\n');
};

var bootstrapper = function(pathIdentifier) {
  var fileSystemModule = require('node:fs');
  var fullContent = fileSystemModule.readFileSync(pathIdentifier, 'utf8');
  processAndOutput(fullContent);
};

bootstrapper('/dev/stdin');