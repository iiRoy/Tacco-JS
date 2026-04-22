const sequenceExaminer = (textualData) => {
    const numericTokens = textualData.match(/(-?\d+(\.\d+)?)/g);

    const primum = parseFloat(numericTokens[0]);
    const medium = parseFloat(numericTokens[1]);
    const ultimum = parseFloat(numericTokens[2]);

    return ((primum + ultimum) === (2 * medium)) ? 'YES' : 'NO';
};

(() => {
    const rawInputContent = require('node:fs').readFileSync(0, 'utf8');
    process.stdout.write(sequenceExaminer(rawInputContent));
})();