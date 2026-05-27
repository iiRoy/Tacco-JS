function processInput(rawData) {
  const NEWLINE_SEPARATOR = "\n";
  const inputLines = rawData.split(NEWLINE_SEPARATOR);

  const firstLineContent = inputLines[0];
  const charSequence = firstLineContent.split("");
  const sequenceLength = charSequence.length;

  const repeatMultiplier = parseInt(inputLines[1], 10);

  let currentChangeTally = 0;

  for (let charIndex = 0; charIndex < sequenceLength; charIndex++) {
    const currentChar = charSequence[charIndex];
    const nextChar = charSequence[charIndex + 1];

    if (currentChar === nextChar) {
      currentChangeTally++;
    }
  }

  let finalChangeResult = currentChangeTally * repeatMultiplier;

  const firstCharacter = charSequence[0];
  const outOfBoundsCharacter = charSequence[sequenceLength];

  if (firstCharacter === outOfBoundsCharacter) {
    finalChangeResult = finalChangeResult + (repeatMultiplier - 1);
  }

  console.log(finalChangeResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
