var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
var sequenceCollection = sourceData.trim().split("\n");

const openerRegistry = new Set(['(', '[']);
const closerRegistry = new Set([')', ']']);
const pairMapping = {
    '(': ')',
    '[': ']'
};

function assessStructure(segmentInput) {
    let processedSegment = segmentInput.replace(/[a-zA-Z]|\.|\s/g, "");

    const extraneousSymbols = processedSegment.replace(/[\(\)\[\]]/g, '');
    if (extraneousSymbols.length > 0) {
        return false; 
    }

    const symbolStack = [];
    for (const charUnit of processedSegment) {
        if (openerRegistry.has(charUnit)) {
            symbolStack.push(charUnit);
        } else if (closerRegistry.has(charUnit)) {
            if (symbolStack.length === 0) {
                return false; 
            }
            const previousOpener = symbolStack.pop();
            if (pairMapping[previousOpener] !== charUnit) {
                return false; 
            }
        }
    }

    return symbolStack.length === 0; 
}

sequenceCollection.forEach(function(currentExpression) {
    const evaluationOutcome = assessStructure(currentExpression);
    process.stdout.write(evaluationOutcome ? "yes\n" : "no\n");
});