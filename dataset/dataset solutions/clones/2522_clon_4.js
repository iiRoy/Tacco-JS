function ProcessInput(sourceText) {
    const documentLines = sourceText.split('\n');

    const [firstQuantifierRaw, limitValueRaw] = documentLines[0].split(' ');
    const boundaryValue = Number(limitValueRaw);

    const numericSamplesRaw = documentLines[1].split(' ');

    const qualifyingElementsCount = numericSamplesRaw
        .map(reading => Number(reading))
        .filter(measure => measure >= boundaryValue)
        .length;

    console.log(qualifyingElementsCount);
}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));