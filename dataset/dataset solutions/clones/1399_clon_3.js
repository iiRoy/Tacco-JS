var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
var expressionLines = sourceData.split('\n');

const TERMINATION_MARKER = '?';

while (true) {
    var currentLineContent = expressionLines.shift();

    var lineSegments = currentLineContent.split(' ');
    var secondSegment = lineSegments[1];

    var isExitConditionMet = (secondSegment === TERMINATION_MARKER);

    if (isExitConditionMet) {
        break;
    }

    var rawCalculationResult = eval(currentLineContent);
    var finalOutputValue = Math.floor(rawCalculationResult);

    console.log(finalOutputValue);
}
