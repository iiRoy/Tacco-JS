const tallySpecificDigit = (originText, soughtDigit) => {
  const recursiveCounter = (remainingText, currentTotal) => {
    if (remainingText.length === 0) {
      return currentTotal;
    }
    const headChar = remainingText[0];
    const tailText = remainingText.slice(1);
    const incrementValue = (headChar === soughtDigit) ? 1 : 0;
    return recursiveCounter(tailText, currentTotal + incrementValue);
  };
  return recursiveCounter(originText, 0);
};

const orchestrateExecution = () => {
  const rawContent = require('fs').readFileSync('/dev/stdin', { encoding: 'utf8' });
  const finalCount = tallySpecificDigit(rawContent, '1');
  console.log(finalCount);
};

orchestrateExecution();