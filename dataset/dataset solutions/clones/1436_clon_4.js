((dataSupplier) => {
    const sourceText = dataSupplier();
    const numericStrings = sourceText.match(/-?\d+(\.\d+)?/g);

    const numberSequence = numericStrings.map(parseFloat);

    const pointOne = { hAxis: numberSequence[0], vAxis: numberSequence[1] };
    const pointTwo = { hAxis: numberSequence[2], vAxis: numberSequence[3] };

    const applySquare = (val) => val * val;

    const deltaH = pointTwo.hAxis - pointOne.hAxis;
    const deltaV = pointTwo.vAxis - pointOne.vAxis;

    const squaredDeltaH = applySquare(deltaH);
    const squaredDeltaV = applySquare(deltaV);

    const sumOfSquares = squaredDeltaH + squaredDeltaV;

    const resultMetric = Math.sqrt(sumOfSquares);

    console.log(resultMetric);
})(
    () => require("fs").readFileSync("/dev/stdin", "utf8")
);