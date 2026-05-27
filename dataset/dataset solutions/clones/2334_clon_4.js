function processInput(inputString) {
  const initialNumber = Math.floor(inputString);

  function* generateDecreasingSequence(startValue) {
    let current = startValue;
    while (current > 0) {
      yield current;
      current -= 2;
    }
  }

  const multiplesOfTenCount = Array.from(generateDecreasingSequence(initialNumber))
    .reduce((accumulator, currentElement) => {
      if (currentElement % 10 === 0) {
        return accumulator + 1;
      }
      return accumulator;
    }, 0);

  console.log(multiplesOfTenCount);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
