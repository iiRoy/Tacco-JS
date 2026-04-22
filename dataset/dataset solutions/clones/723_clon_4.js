const inputOutputSystem = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

const ignoredSymbols = new Set([
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    '/', 'd', ' ', '.'
]);

const refineText = (sourceText) => {
    return Array.from(sourceText).filter(symbol => !ignoredSymbols.has(symbol)).join('');
};

const evaluateSequence = (analyzedText) => {
    const isDepleted = (sequence) => sequence === '';
    const hasBracketPair = (sequence) => /\\[\\]/.test(sequence);
    const hasParenthesisPair = (sequence) => /\(\)/.test(sequence);

    const formulateVerdict = (currentSequence) => {
        if (isDepleted(currentSequence)) {
            return "yes";
        }
        if (hasBracketPair(currentSequence) || hasParenthesisPair(currentSequence)) {
            return "yes";
        }
        return "no";
    };
    
    return formulateVerdict(analyzedText);
};

inputOutputSystem.on('line', (incomingLine) => {
    if (incomingLine === '.') {
        inputOutputSystem.close();
        return;
    }

    const processedSegment = refineText(incomingLine);
    const finalJudgment = evaluateSequence(processedSegment);
    console.log(finalJudgment);
});