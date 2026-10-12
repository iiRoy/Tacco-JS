function processInputContent(sourceText) {
  const lineSegments = sourceText.split('\n');

  // The original code would throw a TypeError if inputs[1] is undefined.
  // By accessing lineSegments[1] directly, if it's undefined (i.e., less than 2 lines),
  // the subsequent call to .match() will naturally throw a TypeError,
  // preserving the error type and behavior, albeit with a slightly different message
  // due to the change from .split() to .match().
  const targetLine = lineSegments[1];

  // Regex to extract the second non-whitespace token from the target line.
  // `\S+` matches one or more non-whitespace characters (first token).
  // `\s+` matches one or more whitespace characters (separator).
  // `(\S*)` captures the second token (zero or more non-whitespace characters).
  const tokenExtractor = /^\S*\s+(\S*)/;
  const matchResult = targetLine.match(tokenExtractor);

  const outcomeMap = {
    '1': 1,
  };

  // If no match, or the captured group is empty/undefined, it's not '1'.
  // The original code would also result in 0 if day[1] is undefined or not '1'.
  const extractedToken = matchResult ? matchResult[1] : undefined;

  // Use a lookup map for the decision, defaulting to 0 if the token is not '1'.
  return outcomeMap[extractedToken] || 0;
}

function EntryPoint(rawInput) {
  console.log(processInputContent(rawInput));
}

EntryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));
