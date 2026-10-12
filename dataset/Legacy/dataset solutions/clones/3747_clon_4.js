function processNumericConstraint(dataString) {
  const constraintValues = dataString.split(" ").map(val => Number(val) | 0);

  const firstLimit = constraintValues[0];
  const secondLimit = constraintValues[1];

  return (firstLimit <= 8 && secondLimit <= 8) ? "Yay!" : ":(";
}

((initialPayload, evaluationOutcome, outcomeType) => {
  if (typeof require !== "undefined") {
    console.log(processNumericConstraint(require("fs").readFileSync("/dev/stdin", "utf8")));
  } else {
    initialPayload = initialPayload.split("\n").slice(1, -1).join("\n");
    evaluationOutcome = (() => {
      try {
        return processNumericConstraint(initialPayload);
      } catch (issue) {
        return issue.stack || issue.message;
      }
    })();
    outcomeType = typeof evaluationOutcome;
    if (outcomeType !== "string") {
      evaluationOutcome = JSON.stringify(evaluationOutcome);
    }

    $("<form>")
      .append(
        [
          [10, initialPayload],
          0,
          [1, outcomeType],
          0,
          [10, evaluationOutcome]
        ].map(itemDescriptor =>
          $(
            itemDescriptor ? "<textarea>" : "<br>",
            itemDescriptor && { rows: itemDescriptor[0], cols: 40, text: itemDescriptor[1] }
          )
        )
      )
      .appendTo("body");
  }
})(`
8 8
`);
