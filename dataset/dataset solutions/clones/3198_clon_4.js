function processInputData(sourceContent) {
  const contentLines = sourceContent.split("\n");
  const numberTokens = contentLines[0].match(/\d+/g);

  const initialQuantity = Number(numberTokens[0]);
  const targetRequirement = Number(numberTokens[1]);

  const derivedLimit = (initialQuantity + 1) >> 1; // Equivalent to Math.ceil(initialQuantity / 2)

  const decisionOutcome = (derivedLimit >= targetRequirement) ? "AFFIRMATIVE" : "NEGATIVE";

  console.log(decisionOutcome);
}

// Auxiliary function for isolated testing (not for production execution)
function isolatedProbe() {
  const mockInput = typeof document !== 'undefined' ? document.getElementById("inputSource").value : "5 3\n";
  processInputData(mockInput);
}

// Primary execution path, retrieving data from standard input
processInputData(require("node:fs").readFileSync("/dev/stdin", "utf8"));