process.stdin.resume();
process.stdin.setEncoding("utf8");

function evaluateInputForUppercase(textSegment) {
  const uppercaseCharacterPattern = /[A-Z]/;
  const patternMatchResult = uppercaseCharacterPattern.test(textSegment);
  return patternMatchResult;
}

const processReceivedData = (incomingText) => {
  const hasUppercaseContent = evaluateInputForUppercase(incomingText);

  let outputCharacter;
  if (hasUppercaseContent) {
    outputCharacter = "A";
  } else {
    outputCharacter = "a";
  }

  console.log(outputCharacter);
};

process.stdin.on("data", processReceivedData);
