function processInput(rawInput) {
  const inputString = rawInput.split("\n")[0];
  const stringLength = inputString.length;

  if (stringLength % 2 === 0) {
    console.log("YES");
    return;
  }

  const halfLength = Math.floor(stringLength / 2);
  const initialSegment = inputString.substring(0, halfLength);
  const finalSegmentReversed = inputString.substring(stringLength - halfLength).split('').reverse().join('');

  const isMiddleAgnosticPalindrome = (initialSegment === finalSegmentReversed);

  if (isMiddleAgnosticPalindrome) {
    const uniqueCharactersCount = new Set(initialSegment).size;
    if (uniqueCharactersCount === 1) {
      console.log("NO");
      return;
    }
  }
  
  console.log("YES");
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
