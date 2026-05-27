const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const [mainString, countString, ...queryTerms] = sourceData.trim().split('\n');

const outputResults = queryTerms.map(termEntry => {
    return Number(mainString.includes(termEntry));
});

console.log(outputResults.join('\n'));
