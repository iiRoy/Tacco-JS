(function(sourceText){
  const textLines = sourceText.split("\n");
  const numElements = parseInt(textLines[0], 10);
  const valueSeries = textLines[1].split(" ").map(Number);

  if (valueSeries.length < 2) {
    console.log("%d", 0);
    return;
  }

  const fluctuationAnalysis = valueSeries.reduce((accumulator, currentMeasure, position, fullSeries) => {
    if (position === 0) {
      return accumulator;
    }

    const priorMeasure = fullSeries[position - 1];
    const delta = currentMeasure - priorMeasure;
    const currentDirection = Math.sign(delta);

    if (currentDirection !== 0) {
      if (accumulator.previousDirection !== 0 && accumulator.previousDirection !== currentDirection) {
        accumulator.reversalCount++;
      }
      accumulator.previousDirection = currentDirection;
    }
    return accumulator;
  }, { reversalCount: 0, previousDirection: 0 });

  console.log("%d", fluctuationAnalysis.reversalCount);
})(require("fs").readFileSync("/dev/stdin", "utf8"));