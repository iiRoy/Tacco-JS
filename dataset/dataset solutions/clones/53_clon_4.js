(function(initialPayload) {
  const numericalSequence = initialPayload.replace(/\n$/, '').split('\n').map(val => +val);

  const processSequenceRecursively = (remainingElements, currentDepository, collectedOutputs) => {
    if (remainingElements.length === 0) {
      return collectedOutputs;
    }

    const [currentElement, ...tailElements] = remainingElements;

    if (currentElement === 0) {
      const depositorySize = currentDepository.length;
      const extractedValue = currentDepository[depositorySize - 1];
      const nextDepositoryState = currentDepository.slice(0, depositorySize - 1);
      const nextCollectedOutputs = [...collectedOutputs, extractedValue];
      return processSequenceRecursively(tailElements, nextDepositoryState, nextCollectedOutputs);
    } else {
      const nextDepositoryState = [...currentDepository, currentElement];
      return processSequenceRecursively(tailElements, nextDepositoryState, collectedOutputs);
    }
  };

  const finalReports = processSequenceRecursively(numericalSequence, [], []);

  finalReports.forEach(reportItem => console.log(reportItem));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));