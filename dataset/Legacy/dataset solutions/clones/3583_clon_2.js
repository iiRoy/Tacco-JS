const processInput = (inputString) => {
  const inputLines = inputString.trim().split('\n');
  const [totalElements, targetIndex] = inputLines[0].map(Number);
  console.log(totalElements - targetIndex + 1);
};
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
