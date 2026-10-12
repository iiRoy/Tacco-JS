const assessStructuralIntegrity = (segmentData) => {
    const filteredSymbols = Array.from(segmentData).filter(sym => {
        return sym === '(' || sym === ')' || sym === '[' || sym === ']';
    });

    const processingStack = [];
    const pairRegistry = {
        '(': ')',
        '[': ']'
    };

    for (const currentSymbol of filteredSymbols) {
        if (pairRegistry[currentSymbol]) {
            processingStack.push(currentSymbol);
        } else {
            if (processingStack.length === 0) {
                return false;
            }
            const poppedSymbol = processingStack.pop();
            if (pairRegistry[poppedSymbol] !== currentSymbol) {
                return false;
            }
        }
    }

    return processingStack.length === 0;
};

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = rawData.trim().split("\n");

lineSegments.forEach(currentSegment => {
    const evaluationResult = assessStructuralIntegrity(currentSegment);
    console.log(evaluationResult ? "yes" : "no");
});
