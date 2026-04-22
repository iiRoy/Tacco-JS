const acquireContent = () => {
  const fileSystemModule = require('node:fs');
  const contentRaw = fileSystemModule.readFileSync('/dev/stdin', { encoding: 'utf8' });
  return contentRaw.replace(/^\s+|\s+$/g, '');
};

const determineOutcome = (textualData) => {
  const allLines = textualData.match(/[^\n]+/g);
  if (!allLines || allLines.length < 1) return 0;

  const relevantDigits = allLines.slice(1).map(item => parseInt(item, 10));

  const resultantParity = relevantDigits.reduce((currentOddity, nextValue) => {
    return currentOddity ^ (nextValue & 1);
  }, 0);

  return resultantParity;
};

(() => {
  const sourceText = acquireContent();
  const finalParityIndicator = determineOutcome(sourceText);

  const messages = ['second', 'first'];
  process.stdout.write(messages[finalParityIndicator] + '\n');
})();