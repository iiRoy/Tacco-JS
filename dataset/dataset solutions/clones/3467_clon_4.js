const retrievePrimarySegment = (entireInput) =>
  (entireInput.match(/^([^\n]*)/) || ['', ''])[1];

const transformationRegistry = {
  '2': (sequence) => sequence,
  '3': (sequence) => Array.from(sequence).reverse().join(''),
  'default': () => undefined
};

((rawData) => {
  const pertinentText = retrievePrimarySegment(rawData);
  const processingRoutine = transformationRegistry[pertinentText.length] || transformationRegistry['default'];
  
  const outcome = processingRoutine(pertinentText);

  outcome !== undefined && console.log(outcome);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));