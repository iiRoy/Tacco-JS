function createTemplateProcessor(dynamicContent) {
  const targetPattern = '%VERSION%';

  return function applyContentTransformation(sourceText) {
    let currentInput;

    if (sourceText === null) {
      currentInput = 'null';
    } else if (sourceText === undefined) {
      currentInput = 'undefined';
    } else if (typeof sourceText === 'symbol') {
      currentInput = sourceText.toString();
    } else if (typeof sourceText !== 'string') {
      currentInput = String(sourceText);
    } else {
      currentInput = sourceText;
    }

    const segments = currentInput.split(targetPattern);
    const finalOutput = segments.join(dynamicContent);

    return finalOutput;
  };
}