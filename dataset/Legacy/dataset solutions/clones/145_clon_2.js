require("fs")
  .readFileSync("/dev/stdin", "utf8") // Acquire the full input content from standard input.
  .split(/\n\n/) // Divide the acquired content into distinct segments based on double newlines.
  .map(function (currentInputChunk) {
    // For each individual segment of the input:
    console.log(currentInputChunk); // Print the original segment to the console.

    // Eliminate all whitespace characters from the current segment.
    // Then, locate the first substring that begins with '1', contains any characters, and ends with '1'.
    // Finally, determine the character count of this identified substring.
    let patternMatchLength = /1.*1/.exec(
      currentInputChunk.replace(/\s/g, "")
    )[0].length;

    // Based on the calculated length, output a specific single character.
    console.log(
      patternMatchLength === 10
        ? "A"
        : patternMatchLength === 25
        ? "B"
        : patternMatchLength === 4
        ? "C"
        : patternMatchLength === 16
        ? "D"
        : patternMatchLength === 11
        ? "E"
        : patternMatchLength === 9
        ? "G"
        : "F"
    );
  });
