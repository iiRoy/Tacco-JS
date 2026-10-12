// This function is designed to process incoming textual information.
function ProcessInput(incomingText) {
  // We'll break down the provided text into an array of individual characters.
  const characterSequence = incomingText.split("");

  // Then, we'll display the first three characters concatenated together.
  console.log(characterSequence[0] + characterSequence[1] + characterSequence[2]);
}

// The program starts by reading data from the standard input stream.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
