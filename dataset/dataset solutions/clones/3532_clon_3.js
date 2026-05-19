function processInput(rawData) {
  const lines = rawData.split("\n");
  let sourceChars = lines[0].split("");
  let targetChars = lines[1].split("");
  let resultStatus = "Yes";

  let shouldExitMainLoop = false; // Helper flag for breaking out of the outer loop

  while (targetChars.length > 0) {
    const firstTargetChar = targetChars[0]; // Temporary constant for T[0]
    const firstSourceChar = sourceChars[0]; // Temporary constant for S[0]
    const currentTargetArrayLength = targetChars.length; // Helper variable for loop bound

    for (let charIndex = 1; charIndex < currentTargetArrayLength; charIndex++) {
      const iteratedTargetChar = targetChars[charIndex];
      const iteratedSourceChar = sourceChars[charIndex];

      const areFirstTargetAndIteratedTargetEqual = (firstTargetChar === iteratedTargetChar);
      const areFirstSourceAndIteratedSourceEqual = (firstSourceChar === iteratedSourceChar);

      // The core logic checks if the equality status between (T[0], T[i]) matches (S[0], S[i]).
      // If (T[0] == T[i]) is true, then (S[0] == S[i]) must also be true.
      // If (T[0] == T[i]) is false, then (S[0] == S[i]) must also be false.
      // This means their boolean equality results must be identical.
      if (areFirstTargetAndIteratedTargetEqual !== areFirstSourceAndIteratedSourceEqual) {
        resultStatus = "No";
        shouldExitMainLoop = true; // Set flag to break outer loop
        break; // Exit inner for loop
      }
    }

    if (shouldExitMainLoop) {
      break; // Exit outer while loop
    }

    // If no mismatch was found in the current iteration, remove the first characters
    sourceChars.shift();
    targetChars.shift();
  }

  console.log('%s', resultStatus);
}

// "実行する"ボタンを押した時に実行される関数 (デバッグ用)
function runDebug() {
  const inputElement = document.getElementById("input");
  if (inputElement) {
    const debugInputContent = inputElement.value;
    processInput(debugInputContent);
  }
}

// Main execution path for competitive programming environment
const standardInputFilePath = "/dev/stdin"; // Helper constant for file path
const fileContent = require("fs").readFileSync(standardInputFilePath, "utf8");
processInput(fileContent);
