const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const wordPageMap = inputLines.reduce((accumulator, currentLine) => {
    const [term, pageStr] = currentLine.split(' ');
    const pageNum = parseInt(pageStr, 10);
    if (!accumulator.has(term)) {
        accumulator.set(term, []);
    }
    accumulator.get(term).push(pageNum);
    return accumulator;
}, new Map());

const sortedTerms = Array.from(wordPageMap.keys()).sort();

sortedTerms.forEach(currentTerm => {
    console.log(currentTerm);
    const associatedPages = wordPageMap.get(currentTerm);
    associatedPages.sort((a, b) => a - b);
    console.log(associatedPages.join(' '));
});
