function processInputData(rawData) {
  const parsedLines = rawData.split("\n");

  // Convert string arrays to number arrays upfront
  const primarySequence = parsedLines[1].split(" ").map(Number);
  const valueSetA = parsedLines[2].split(" ").map(Number);
  const valueSetB = parsedLines[3].split(" ").map(Number);

  // Utilize Array.prototype.reduce for accumulating the final sum
  const finalTally = primarySequence.reduce((currentTotal, currentSequenceElement, elementIndex) => {
    // Calculate the base value for the current element
    const baseContribution = valueSetA[currentSequenceElement - 1];

    // Determine if a bonus contribution applies
    // The bonus is added if it's not the first element AND
    // the current element's value is exactly one greater than the previous element's value.
    const bonusContribution = (elementIndex > 0 && currentSequenceElement === primarySequence[elementIndex - 1] + 1)
      ? valueSetB[primarySequence[elementIndex - 1] - 1]
      : 0;

    // Return the accumulated sum including base and bonus contributions
    return currentTotal + baseContribution + bonusContribution;
  }, 0); // Initialize the accumulator with 0

  console.log(finalTally);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
