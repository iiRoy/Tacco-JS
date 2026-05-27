function analyzeSequence(sourceString) {
  if (0 === (sourceString.length & 1)) {
    console.log("No");
    return;
  }

  let outcomeIndicator = "Yes";
  const segments = sourceString.split("hi");

  if (segments.length > 1) {
    outcomeIndicator = "No";
  }

  console.log(outcomeIndicator);
}

analyzeSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
