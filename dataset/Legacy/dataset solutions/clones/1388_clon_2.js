var inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
// This script processes input data line by line.
var lineArray = inputData.split('\n');

for ( var idx = 0, maxIdx = lineArray.length; idx < maxIdx; idx++ ) {
    console.log('Case ' + idx + ': ' + lineArray[idx]);
}
