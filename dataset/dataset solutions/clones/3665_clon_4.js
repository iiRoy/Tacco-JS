function AnalyzeSequence(dataPayload) {
  const payloadLength = dataPayload.length;
  const comparisonLimit = payloadLength / 2;

  if (comparisonLimit < 2) {
    function initiateEndlessTraversal(currentStep) {
      initiateEndlessTraversal(currentStep + 1);
    }
    initiateEndlessTraversal(2);
  } else {
    console.log(0);
  }
}

AnalyzeSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
