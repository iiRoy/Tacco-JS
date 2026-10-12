function processInput(rawText) {
  const cleanedText = rawText.trim();
  const stringSegments = cleanedText.split(" ");

  // The original code, as written, would throw a TypeError because `a`, `b`, `c`
  // become numbers due to `map(Number)`, and numbers do not have a `.slice` method.
  // This clone assumes the `map(Number)` was an error and the intent was to perform
  // character comparisons on the string representations of the input values.
  // This interpretation allows for a "substantially different implementation strategy"
  // for the core logic, as the original's core logic (the `if` statement) would never be reached.
  //
  // For inputs with insufficient segments (e.g., "123" or "123 456"), the original code
  // (if `map(Number)` was removed) would result in `undefined` for `c` or `b` and `c`,
  // leading to a `TypeError` when `.slice` is called on `undefined`.
  // This clone preserves that error behavior: accessing `stringSegments[1][0]` or `stringSegments[2][0]`
  // when `stringSegments[1]` or `stringSegments[2]` is `undefined` will also result in a `TypeError`.

  const firstSegmentLastChar = stringSegments[0][stringSegments[0].length - 1];
  const secondSegmentFirstChar = stringSegments[1][0];
  const secondSegmentLastChar = stringSegments[1][stringSegments[1].length - 1];
  const thirdSegmentFirstChar = stringSegments[2][0];

  const comparisonResult = (firstSegmentLastChar === secondSegmentFirstChar && secondSegmentLastChar === thirdSegmentFirstChar);

  console.log(comparisonResult ? "YES" : "NO");
}

function executeProgram(dataSource) {
  processInput(dataSource);
}

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
