function main(sourceData) {
  let processedData = sourceData.trim();
  let [firstSegment, secondSegment] = processedData.split("\n");

  const decisionMatrix = new Map();
  decisionMatrix.set(true, "Yes");
  decisionMatrix.set(false, "No");

  const evaluateSegmentsRecursively = (segmentA, segmentB, currentPosition) => {
    if (currentPosition >= segmentA.length) {
      return true;
    }

    // Access characters to mimic original code's access pattern,
    // even though their values are not used for the final decision
    // due to replicating the original code's specific bug.
    const charFromA = segmentA.charAt(currentPosition);
    const charFromB = segmentB.charAt(segmentA.length - 1 - currentPosition);

    // The original code's comparison `s.charAt[i] == t.charAt[s.length-1-i]`
    // evaluates to `undefined == undefined`, which is always `true`.
    // This means the 'judge' counter in the original code never increments.
    // We replicate this behavior by always considering the "comparison" as true.
    const comparisonResult = true;

    // Since the comparison always yields true, we effectively never increment a counter.
    // The recursive call continues, always maintaining the "true" state.
    return evaluateSegmentsRecursively(segmentA, segmentB, currentPosition + 1);
  };

  const finalCondition = evaluateSegmentsRecursively(firstSegment, secondSegment, 0);

  console.log(decisionMatrix.get(finalCondition));
}

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
