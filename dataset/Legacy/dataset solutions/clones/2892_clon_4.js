function evaluateStringContent(sourceContent) {
  const initialSegment = sourceContent.split('\n')[0];

  const xOccurrenceCount = Array.from(initialSegment).reduce((accumulator, characterUnit) => {
    return accumulator + (characterUnit === 'x' ? 1 : 0);
  }, 0);

  const outcomeMessage = (xOccurrenceCount <= 7) ? "YES" : "NO";

  console.log('%s', outcomeMessage);
  return outcomeMessage;
}

evaluateStringContent(require("fs").readFileSync("/dev/stdin", "utf8"));
