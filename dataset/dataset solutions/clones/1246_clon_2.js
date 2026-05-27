const circleRadius = Number(
  require('fs').readFileSync('/dev/stdin', 'ascii')
);

// Compute the area of the circle using the formula: π * radius^2
const computedArea = (Math.PI * circleRadius * circleRadius).toFixed(6);

// Compute the circumference of the circle using the formula: 2 * π * radius
const computedCircumference = (2 * Math.PI * circleRadius).toFixed(6);

// Output the calculated area and circumference, each formatted to six decimal places.
console.log(computedArea, computedCircumference);
