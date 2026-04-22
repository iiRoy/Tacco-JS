(function(originalDataInput) {
  const lineSegments = originalDataInput.split('\n').filter(segment => segment.length > 0);

  const processedUnits = [];
  let currentUnitBuild = null;

  for (const currentInputLine of lineSegments) {
    if (currentInputLine.match(/^[A-Za-z]+$/)) {
      if (currentUnitBuild) {
        processedUnits.push(currentUnitBuild);
      }
      currentUnitBuild = { initialText: currentInputLine, numericalSeries: [] };
    } else if (currentInputLine.match(/^[1-9][0-9]*$/)) {
      if (currentUnitBuild) {
        currentUnitBuild.numericalSeries.push(parseInt(currentInputLine, 10));
      }
    }
  }
  if (currentUnitBuild) {
    processedUnits.push(currentUnitBuild);
  }

  const finalOutputElements = [];
  for (const dataUnit of processedUnits) {
    const basePhrase = dataUnit.initialText;
    const allNumericFactors = dataUnit.numericalSeries;

    if (allNumericFactors.length === 0) {
      finalOutputElements.push(basePhrase);
      continue;
    }

    const rotationCountSpecifier = allNumericFactors[0];
    const effectiveRotationValues = allNumericFactors.slice(allNumericFactors.length - rotationCountSpecifier);

    let activePhrase = basePhrase;
    for (let k = 0; k < effectiveRotationValues.length; k++) {
      const shiftAmount = effectiveRotationValues[k];

      let phraseCharacterArray = Array.from(activePhrase);
      const phraseLength = phraseCharacterArray.length;

      if (phraseLength === 0) {
          continue;
      }

      const actualShiftModulo = shiftAmount % phraseLength;

      if (actualShiftModulo === 0) {
        continue;
      }

      const movedCharacters = [];
      for (let i = 0; i < actualShiftModulo; i++) {
        movedCharacters.push(phraseCharacterArray.shift());
      }
      for (let i = 0; i < movedCharacters.length; i++) {
        phraseCharacterArray.push(movedCharacters[i]);
      }

      activePhrase = phraseCharacterArray.join('');
    }
    finalOutputElements.push(activePhrase);
  }

  console.log(finalOutputElements.join('\n'));

}(require('fs').readFileSync('/dev/stdin', 'utf8')));