function processInputString(rawData) {
  const trimmedInput = rawData.trim();
  let diffCount = 0;
  const targetSequence = "CODEFESTIVAL2016";

  const inputLength = trimmedInput.length;

  for (let charIdx = 0; charIdx < inputLength; charIdx++) {
    const currentInputChar = trimmedInput.charAt(charIdx);
    const currentTargetChar = targetSequence.charAt(charIdx);

    if (currentInputChar !== currentTargetChar) {
      diffCount = diffCount + 1;
    }
  }

  const displayResult = (finalCount) => {
    console.log(finalCount);
  };

  displayResult(diffCount);
}

processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));
