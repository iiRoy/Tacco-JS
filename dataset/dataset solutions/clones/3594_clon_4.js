function computeCentralValue(sequence) {
  const sortedElements = [...sequence].sort((valA, valB) => valA.localeCompare(valB));
  const midPointIndex = Math.floor(sortedElements.length / 2);
  return sortedElements[midPointIndex];
}

function ProcessInput(rawData) {
  const inputLines = rawData.split('\n');
  const elementCount = Number.parseInt(inputLines[0]);
  const sourceElements = inputLines[1].split(' ');

  const allSubsequences = Array.from({ length: elementCount }, (_, startPosition) =>
    Array.from({ length: elementCount - startPosition }, (_, lengthOffset) => {
      const endPosition = startPosition + 1 + lengthOffset;
      return sourceElements.slice(startPosition, endPosition);
    })
  ).flat();

  const derivedCentralValues = allSubsequences.map(computeCentralValue);

  console.log(computeCentralValue(derivedCentralValues));
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
