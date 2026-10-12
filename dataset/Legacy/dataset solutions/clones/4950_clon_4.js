function processText(rawData) {
  // Employ a regular expression to declaratively extract the initial 0-4 characters
  // and the remaining portion of the input string. This diverges from sequential slicing.
  // The pattern captures up to four characters (`.{0,4}`) into the first group,
  // and any subsequent characters (`.*`) into the second group.
  const segmentPattern = /^(.{0,4})(.*)$/;
  const capturedSegments = rawData.match(segmentPattern);

  // The `match` method, when used with a non-global regex, returns an array where:
  // - Index 0 is the full matched string.
  // - Index 1 is the content of the first capturing group (the prefix).
  // - Index 2 is the content of the second capturing group (the suffix).
  // This pattern guarantees a match for any string, including empty ones,
  // ensuring robust behavior equivalent to the original `slice` calls.
  const leadingContent = capturedSegments[1];
  const trailingContent = capturedSegments[2];

  // Output the two extracted parts, joined by a space, to strictly preserve
  // the observable console output behavior of the original code.
  console.log(leadingContent + ' ' + trailingContent);
}

// The mechanism for reading standard input is an external dependency and
// must remain identical to ensure behavioral equivalence.
processText(require("fs").readFileSync("/dev/stdin", "utf8"));
