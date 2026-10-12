const processInput = (inputString) => {
  const parsedValue = parseInt(inputString);
  console.log(parsedValue ? 0 : 1);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
