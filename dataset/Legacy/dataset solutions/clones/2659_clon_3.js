function processInput(rawData) {
  const paramStrings = rawData.split(' ');
  const limitK = parseInt(paramStrings[0], 10);
  const centerVal = parseInt(paramStrings[1], 10);

  const rangeOffset = limitK - 1;
  const sequenceElements = [];

  const startValue = centerVal - rangeOffset;
  const endValue = centerVal + rangeOffset;

  for (let currentNum = startValue; currentNum <= endValue; currentNum++) {
    sequenceElements.push(currentNum);
  }

  const resultSequence = sequenceElements.join(' ');
  console.log(resultSequence);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
