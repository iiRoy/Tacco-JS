const processInputAndDivide = (rawInputLine) => {
  const [numeratorStr, denominatorStr = undefined] = rawInputLine.split(' ');
  console.log(numeratorStr / denominatorStr);
};

processInputAndDivide(require('fs').readFileSync('/dev/stdin', 'utf8'));
