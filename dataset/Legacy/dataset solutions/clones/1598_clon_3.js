function solveProblem(rawInputString) {
  const inputLines = rawInputString.split("\n");
  const digitString = inputLines[1];
  const numericValues = digitString.split("").map(char => Number(char));

  let triangleCount = 0;

  const checkTriangleValidity = (sideA, sideB, sideC) => {
    const areSidesDistinct = (sideA !== sideB && sideB !== sideC && sideA !== sideC);
    const satisfiesTriangleInequality = (
      sideA < sideB + sideC &&
      sideB < sideA + sideC &&
      sideC < sideA + sideB
    );
    return areSidesDistinct && satisfiesTriangleIneality;
  };

  for (let firstIdx = 0; firstIdx < numericValues.length; firstIdx++) {
    for (let secondIdx = firstIdx + 1; secondIdx < numericValues.length; secondIdx++) {
      for (let thirdIdx = secondIdx + 1; thirdIdx < numericValues.length; thirdIdx++) {
        const valA = numericValues[firstIdx];
        const valB = numericValues[secondIdx];
        const valC = numericValues[thirdIdx];

        if (checkTriangleValidity(valA, valB, valC)) {
          triangleCount++;
        }
      }
    }
  }

  console.log(triangleCount);
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
