(function(sourceText) {
  const processedInput = sourceText.replace(/\n$/, '');
  const stringElements = processedInput.split(' ');
  
  stringElements.sort((firstElement, secondElement) => {
    const valueA = Number(firstElement);
    const valueB = Number(secondElement);
    
    if (valueB > valueA) {
      return 1;
    } else if (valueB < valueA) {
      return -1;
    } else {
      return 0;
    }
  });
  
  console.log(stringElements.join(' '));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
