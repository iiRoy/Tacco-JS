function determineNumericExtent(expression) {
  const components = expression.split(' ');
  const magnitude = +components[0];
  const scale = +components[1];

  let calculatedLength;

  if (magnitude <= 0) {
    calculatedLength = 0;
  } else {
    calculatedLength = ~~(Math.log(magnitude) / Math.log(scale)) + 1;
  }

  console.log(calculatedLength);
}

determineNumericExtent(require("node:fs").readFileSync(0, "utf8"));