var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
var processedString = rawInputData.trim();
var oLengths = [];
const pattern = /(J+)(O+)(I+)/g;
const allMatches = [...processedString.matchAll(pattern)];
allMatches.forEach(matchResult => {
    const jSequence = matchResult[1];
    const oSequence = matchResult[2];
    const iSequence = matchResult[3];
    const jLen = jSequence.length;
    const oLen = oSequence.length;
    const iLen = iSequence.length;
    if (jLen >= oLen && iLen >= oLen) {
        oLengths.push(oLen);
    }
});
console.log(Math.max(...oLengths));
