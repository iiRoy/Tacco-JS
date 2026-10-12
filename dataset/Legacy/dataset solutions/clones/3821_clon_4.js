const checkProximity = (coordA, coordB, limit) => Math.abs(coordA - coordB) <= limit;

function processCoordinates(inputLine) {
  const numericValues = inputLine.split(" ").map(val => +val);

  const [firstPoint, midPoint, lastPoint, maxDistance] = numericValues;

  const directPathViable = checkProximity(firstPoint, lastPoint, maxDistance);
  const indirectPathViable = checkProximity(firstPoint, midPoint, maxDistance) &&
                               checkProximity(midPoint, lastPoint, maxDistance);

  const finalOutcome = directPathViable || indirectPathViable;

  const resultMapping = new Map([[true, "Yes"], [false, "No"]]);

  console.log(resultMapping.get(finalOutcome));
}

processCoordinates(require("fs").readFileSync("/dev/stdin","utf8"));
