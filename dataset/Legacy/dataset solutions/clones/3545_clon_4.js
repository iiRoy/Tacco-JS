const processInputContent = (contentString) => {
  const containsTargetDigit = Array.from(contentString).some(charUnit => charUnit === '2');

  const finalVerdict = containsTargetDigit ? 'No' : 'Yes';

  console.log(finalVerdict);
};

processInputContent(require('fs').readFileSync('/dev/stdin', 'utf8'));
