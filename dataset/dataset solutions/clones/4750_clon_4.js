let inputBuffer = "";

process.stdin.on("data", (segment) => {
  inputBuffer += segment.toString();
});

process.stdin.on("end", () => {
  const lineSegments = inputBuffer.trim().split("\n");

  const primaryCount = Number(lineSegments[0]);
  const pairData = lineSegments.slice(1);

  const numericalTuples = pairData.map((lineText) => {
    const parts = lineText.split(" ").map(Number);
    return { firstComponent: parts[0], secondComponent: parts[1] };
  });

  const cumulativeOffset = numericalTuples.reduceRight((currentAccumulatedValue, currentEntry) => {
    const { firstComponent, secondComponent } = currentEntry;
    const currentComposite = firstComponent + currentAccumulatedValue;
    const modResult = currentComposite % secondComponent;

    const requiredAddition = (secondComponent - modResult) % secondComponent;

    return currentAccumulatedValue + requiredAddition;
  }, 0);

  process.stdout.write(String(cumulativeOffset) + "\n");
});