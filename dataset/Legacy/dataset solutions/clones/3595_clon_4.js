const determineCentralValue = (sourceArray) => {
  const workingArray = [...sourceArray];
  for (let idxA = 0; idxA < workingArray.length - 1; idxA++) {
    for (let idxB = 0; idxB < workingArray.length - 1 - idxA; idxB++) {
      if (workingArray[idxB].localeCompare(workingArray[idxB + 1]) > 0) {
        [workingArray[idxB], workingArray[idxB + 1]] = [workingArray[idxB + 1], workingArray[idxB]];
      }
    }
  }
  return workingArray[Math.floor(workingArray.length / 2)];
};

function executeProcessing(rawData) {
  const [firstLineContent, secondLineContent] = rawData.split('\n');
  const elementCount = Number(firstLineContent);
  const sourceElements = secondLineContent.split(' ');

  const allSubsequences = Array.from({ length: elementCount }, (_, startIdx) =>
    Array.from({ length: elementCount - startIdx }, (_, lengthOffset) =>
      sourceElements.slice(startIdx, startIdx + lengthOffset + 1)
    )
  ).flat();

  const subsequenceMedians = allSubsequences.map(determineCentralValue);

  console.log(determineCentralValue(subsequenceMedians));
}

executeProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));
