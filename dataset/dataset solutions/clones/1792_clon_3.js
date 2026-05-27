function parseTwoNumbers(lineContent) {
  const parts = lineContent.split(" ");
  return {
    val1: Number(parts[0]),
    val2: Number(parts[1])
  };
}

function processInput(rawInputData) {
  const inputLines = rawInputData.split("\n");

  const firstLineParsed = parseTwoNumbers(inputLines[0]);
  const positionA = firstLineParsed.val1;
  const velocityA = firstLineParsed.val2;

  const secondLineParsed = parseTwoNumbers(inputLines[1]);
  const positionB = secondLineParsed.val1;
  const velocityB = secondLineParsed.val2;

  const totalTimeLimit = Number(inputLines[2]);

  let currentSeparation = Math.abs(positionA - positionB);

  const effectiveSpeedDifference = velocityA - velocityB;

  if (currentSeparation === 0) {
    console.log("YES");
    return;
  }

  for (let timeElapsed = 0; timeElapsed < totalTimeLimit; timeElapsed++) {
    currentSeparation -= effectiveSpeedDifference;
    if (currentSeparation === 0) {
      break;
    }
  }

  console.log(currentSeparation === 0 ? "YES" : "NO");
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
