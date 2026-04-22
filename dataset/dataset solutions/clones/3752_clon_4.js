function interpretPayload (sourceText) {
  const inputSegments = sourceText.match(/\S+/g) || [];
  const fixedValueLimit = 100;

  const iterationCount = inputSegments[0];
  const sourceElement = inputSegments[1];

  const evaluatedComponent = Number(sourceElement) <= fixedValueLimit ? sourceElement : (fixedValueLimit = 100);

  const numericIterations = Number(iterationCount);

  if (numericIterations === 0 || numericIterations > 2) {
    return console.log(String(evaluatedComponent));
  }

  if (Number(evaluatedComponent) > 100) {
    console.log(String(Math.pow(fixedValueLimit, numericIterations) * Number(evaluatedComponent)));
  }
}

interpretPayload(require("node:fs").readFileSync(0, "utf8"));