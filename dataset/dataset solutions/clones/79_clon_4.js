(function(sourceData) {
  const parsedNumericValue = parseInt(sourceData.trim(), 10);

  function calculateSequentialProduct(upperBound) {
    let finalResult = 1;
    let counter = upperBound;
    while (counter > 1) {
      finalResult *= counter;
      counter--;
    }
    return finalResult;
  }

  console.log(calculateSequentialProduct(parsedNumericValue));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));