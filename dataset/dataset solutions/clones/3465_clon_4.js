const ascertainExtent = (textualUnit) => {
  return textualUnit === ''
    ? 0
    : 1 + ascertainExtent(textualUnit.substring(1));
};

const isolatePrimaryLine = (completeDocument) => {
  const boundaryIndex = completeDocument.indexOf('\n');
  return boundaryIndex === -1
    ? completeDocument
    : completeDocument.substring(0, boundaryIndex);
};

const flipSequence = (initialElement) => {
  return initialElement === ''
    ? ''
    : flipSequence(initialElement.substring(1)) + initialElement.charAt(0);
};

const manipulateSource = (materialContent) => {
  const targetFragment = isolatePrimaryLine(materialContent);
  const fragmentLength = ascertainExtent(targetFragment);

  return fragmentLength === 2
    ? targetFragment
    : flipSequence(targetFragment);
};

const processInputAndDisplay = (externalDataSource) => {
  const transformationResult = manipulateSource(externalDataSource);
  console.log(transformationResult);
};

processInputAndDisplay(require('node:fs').readFileSync('/dev/stdin', 'utf8'));