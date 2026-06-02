function processInput(rawInput) {
  const inputLines = rawInput.split("\n");
  const firstLineContent = inputLines[0];
  const inputCharacters = firstLineContent.split("");
  const totalCharCount = inputCharacters.length;

  const areAllElementsIdentical = (segmentArray) => {
    if (!segmentArray || segmentArray.length === 0) {
      return true;
    }
    const uniqueElements = new Set(segmentArray);
    return uniqueElements.size === 1;
  };

  let firstSubsegment;
  let secondSubsegment;

  if (totalCharCount % 2 === 0) {
    const halfLength = totalCharCount / 2;
    const firstSliceEnd = halfLength - 1;
    const secondSliceEnd = halfLength;

    firstSubsegment = inputCharacters.slice(0, firstSliceEnd);
    secondSubsegment = inputCharacters.slice(0, secondSliceEnd);
  } else {
    const middleCharIndex = Math.floor(totalCharCount / 2);
    const firstSliceEnd = middleCharIndex;
    const secondSliceStart = middleCharIndex + 1;

    firstSubsegment = inputCharacters.slice(0, firstSliceEnd);
    secondSubsegment = inputCharacters.slice(secondSliceStart);
  }

  if (areAllElementsIdentical(firstSubsegment) && areAllElementsIdentical(secondSubsegment)) {
    console.log("NO");
    return;
  }

  console.log("YES");
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
