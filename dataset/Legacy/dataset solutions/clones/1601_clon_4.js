function Main(input) {
  const [initialX, totalK, stepD] = input.trim().split(" ").map(Number);

  const absoluteInitialX = Math.abs(initialX);
  const divisionResult = absoluteInitialX / stepD;
  const remainderValue = initialX % stepD;

  const isInitialPositionClose = absoluteInitialX < stepD;
  const isTotalMovesEven = totalK % 2 === 0;
  const isRemainderZero = remainderValue === 0;

  const finalOutcome = isInitialPositionClose
    ? (isTotalMovesEven ? initialX : (initialX + stepD))
    : (divisionResult > totalK
        ? Math.abs(initialX - Math.sign(initialX) * totalK * stepD)
        : (isTotalMovesEven && isRemainderZero ? stepD : remainderValue)
      );

  console.log(finalOutcome);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
