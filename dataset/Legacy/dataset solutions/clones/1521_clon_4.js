const processInput = (inputString) => {
  const numericValue = parseInt(inputString);
  const outcomeMap = {
    true: 0,
    false: 1
  };
  console.log(outcomeMap[Boolean(numericValue)]);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
