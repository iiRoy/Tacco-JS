function EvaluateSequence(sourceData) {
  const lineContent = sourceData.split("\n");
  const processedText = lineContent[0];

  const firstOccurrenceC = processedText.indexOf('C');
  const lastOccurrenceF = processedText.lastIndexOf('F');

  const finalOutcome = (firstOccurrenceC > -1 && lastOccurrenceF > -1 && firstOccurrenceC < lastOccurrenceF) ? "Yes" : "No";

  console.log(finalOutcome);
}

EvaluateSequence(require("fs").readFileSync("/dev/stdin", "utf8"));