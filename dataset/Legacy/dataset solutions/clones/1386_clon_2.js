var rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineSegments = rawInputContent.split('\n');

for ( var lineIndex = 0, totalLines = lineSegments.length; lineIndex < totalLines; lineIndex++ ) {
    var currentCaseIdentifier = lineIndex + 1;
    console.log('Case ' + currentCaseIdentifier + ': ' + lineSegments[lineIndex]);
}
