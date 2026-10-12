const processInputAndCalculate = (sourceData) => {
  const inputStringSegment = sourceData.trim().split('\n')[1];
  const characterArray = Array.from(inputStringSegment);

  const whiteCharacterCount = characterArray.filter(element => element === 'W').length;
  const redCharacterCount = characterArray.filter(element => element === 'R').length;

  const requiredSwaps = characterArray.slice(0, redCharacterCount).filter(element => element === 'W').length;
  
  return console.log(Math.min(requiredSwaps, Math.min(whiteCharacterCount, redCharacterCount)));
};

process.env.MYTEST ? test() : processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
