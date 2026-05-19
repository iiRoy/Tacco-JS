function computeDifference(sourceText) {
  const processedText = sourceText.replace(/^\s+|\s+$/g, '');
  const lines = processedText.split('\n');

  const countMatch = lines[0].match(/\d+/);
  const elementCount = Number(countMatch[0]);

  const dataString = lines[1];
  const numberStrings = dataString.match(/-?\d+/g);
  const dataValues = numberStrings.map(Number);

  dataValues.sort((firstVal, secondVal) => firstVal - secondVal);

  const lowerMidIndex = elementCount / 2;
  const upperMidIndex = lowerMidIndex + 1;

  const selectedPair = dataValues.slice(lowerMidIndex, upperMidIndex + 1);
  
  console.log(selectedPair[1] - selectedPair[0]);
}

computeDifference(require('fs').readFileSync('/dev/stdin', 'utf8'));
