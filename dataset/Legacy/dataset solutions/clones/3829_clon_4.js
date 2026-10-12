function Main(input) {
  const parsedData = input.split(/\s/g);
  const sourceString = parsedData[0];
  const desiredIndex = Number(parsedData[1]) - 1;

  const stringLength = sourceString.length;
  const uniqueSubstrings = new Set();

  for (let startPosition = 0; startPosition < stringLength; startPosition++) {
    for (let endPosition = startPosition + 1; endPosition <= stringLength; endPosition++) {
      uniqueSubstrings.add(sourceString.substring(startPosition, endPosition));
    }
  }

  const finalSortedSubstrings = Array.from(uniqueSubstrings).sort();

  console.log('%s', finalSortedSubstrings[desiredIndex]);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
