function ProcessInput(rawContent) {
  const contentLines = rawContent.split("\n");
  const targetSequence = contentLines[0];

  const { initialCharPosition, finalCharPosition } = Array.from(targetSequence).reduce(
    (accumulator, currentCharacter, currentIndex) => {
      if (currentCharacter === "C" && accumulator.initialCharPosition === undefined) {
        accumulator.initialCharPosition = currentIndex;
      }
      if (currentCharacter === "F") {
        accumulator.finalCharPosition = currentIndex;
      }
      return accumulator;
    },
    { initialCharPosition: undefined, finalCharPosition: undefined }
  );

  console.log(initialCharPosition < finalCharPosition ? "Yes" : "No");
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
