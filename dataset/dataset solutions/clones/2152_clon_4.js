function evaluateInputContent(incomingStream) {
  const processedNumbers = incomingStream.split('\n').reduce((collectionAccumulator, currentEntry, entryIndex) => {
    if (entryIndex === 0) {
      return collectionAccumulator; // Skip the first line (N value)
    }
    const trimmedEntry = currentEntry.trim();
    if (trimmedEntry === '') {
      return collectionAccumulator; // Skip empty or whitespace-only lines
    }
    const numericForm = Number(trimmedEntry);
    if (!Number.isNaN(numericForm)) {
      collectionAccumulator.push(numericForm);
    }
    return collectionAccumulator;
  }, []);

  const anyViolationDetected = processedNumbers.some(currentItem => {
    const isParityEven = currentItem % 2 === 0;
    const failsDivisibilityCriteria = currentItem % 3 !== 0 && currentItem % 5 !== 0;
    return isParityEven && failsDivisibilityCriteria;
  });

  const deniedOutcomeText = "REJECTED";
  const approvedOutcomeText = "ACCEPTED";

  if (anyViolationDetected) {
    console.log(deniedOutcomeText);
  } else {
    console.log(approvedOutcomeText);
  }
}

evaluateInputContent(require("fs").readFileSync("/dev/stdin", "utf8"));