((sourceContent) => {
  const numericalElements = sourceContent.split(' ').map(textualItem => parseInt(textualItem, 10));
  const [initialValue, subsequentValue] = numericalElements;
  const finalComputation = (initialValue / 2) * subsequentValue;
  console.log(finalComputation);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
