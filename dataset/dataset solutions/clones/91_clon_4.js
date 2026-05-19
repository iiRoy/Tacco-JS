(function(input) {
  const rawNumbers = input.trimEnd().split('\n');

  function* numberIterator(sourceArray) {
    for (const item of sourceArray) {
      yield Number(item);
    }
  }

  const numberProducer = numberIterator(rawNumbers);

  function* testCaseIterator(producer) {
    let currentCaseSize;
    while ((currentCaseSize = producer.next().value) !== 0) {
      const caseValues = [];
      for (let k = 0; k < currentCaseSize; k++) {
        caseValues.push(producer.next().value);
      }
      yield caseValues;
    }
  }

  const problemSets = testCaseIterator(numberProducer);

  for (const currentSet of problemSets) {
    const finalResult = currentSet.reduce((accumulator, currentValue) => {
      const maxEndingHere = Math.max(currentValue, accumulator.maxEndingHere + currentValue);
      const globalMax = Math.max(accumulator.globalMax, maxEndingHere);
      return { maxEndingHere, globalMax };
    }, { maxEndingHere: -Infinity, globalMax: -Infinity });

    console.log(finalResult.globalMax);
  }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
