const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

const numericSequence = rawInputContent.split("\n").map(item => +item);

console.log(analyzeSequence());

function analyzeSequence() {
  const negativeOutcome = "No";

  const totalElements = numericSequence[0];

  const encounteredNumbers = {};

  for (let currentIdx = 1; currentIdx <= totalElements; currentIdx++) {
    if ((numericSequence[currentIdx] ^ currentIdx) & 1) {
      return negativeOutcome;
    }

    let currentUpper = numericSequence[currentIdx];
    let currentLower = currentIdx;
    encounteredNumbers[currentUpper] = 1;

    while (currentIdx < currentUpper) {
      currentIdx++;
      if (numericSequence[currentIdx] !== currentIdx) {
        return negativeOutcome;
      }
      currentIdx++;
      if ((numericSequence[currentIdx] ^ currentIdx) & 1) {
        return negativeOutcome;
      }

      if (currentUpper < numericSequence[currentIdx]) {
        currentUpper = numericSequence[currentIdx];
        encounteredNumbers[currentUpper] = 1;
      } else if (currentLower === numericSequence[currentIdx]) {
        do {
          currentLower += 2;
        } while (encounteredNumbers[currentLower]);
      } else {
        return negativeOutcome;
      }
    }
  }

  return "Yes";
}
