function transformString(sourceText) {
  const processedText = sourceText.trim();
  const textUnits = [...processedText];

  const { initialSegment, finalSegment } = textUnits.reduce((accumulator, unitChar, unitIndex) => {
    if (unitIndex < 3) {
      accumulator.initialSegment.push(unitChar);
    } else if (unitIndex >= 4 && unitIndex < 10) {
      accumulator.finalSegment.push(unitChar);
    }
    return accumulator;
  }, { initialSegment: [], finalSegment: [] });

  let constructedOutput = initialSegment.join('');
  constructedOutput += '8';
  constructedOutput += finalSegment.join('');

  return constructedOutput;
}

function executeTransformation(sourceData) {
  console.log(transformString(sourceData));
}

executeTransformation(require('fs').readFileSync('/dev/stdin', 'utf8'));
