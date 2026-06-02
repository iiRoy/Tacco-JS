console.log(((inputString) => {
  const lines = inputString.trim().split('\n');
  const [firstLineElements, secondLineElements] = lines.map(line => line.split(' ').map(Number));

  const sequenceLength = firstLineElements[0];
  const inputSequence = secondLineElements;

  const modulusValue = 1000000007;

  const initialProcessingState = {
    currentProduct: 1,
    elementCounts: new Map([[0, 3]])
  };

  const finalProcessingState = inputSequence.reduce((accumulator, currentElementValue) => {
    const currentElementCount = accumulator.elementCounts.get(currentElementValue) || 0;

    const nextProduct = (accumulator.currentProduct * currentElementCount) % modulusValue;

    const nextElementCounts = new Map(accumulator.elementCounts);

    nextElementCounts.set(currentElementValue, currentElementCount - 1);
    nextElementCounts.set(currentElementValue + 1, (nextElementCounts.get(currentElementValue + 1) || 0) + 1);

    return {
      currentProduct: nextProduct,
      elementCounts: nextElementCounts
    };
  }, initialProcessingState);

  return `${finalProcessingState.currentProduct}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));
