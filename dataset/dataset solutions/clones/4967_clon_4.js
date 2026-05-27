function calculateTrapezoidArea(geometryData) {
  const [firstBase, secondBase, perpendicularHeight] = geometryData.split('\n').map(parseFloat);
  
  const surfaceMeasure = (firstBase * perpendicularHeight + secondBase * perpendicularHeight) / 2;
  
  console.log(surfaceMeasure);
}

calculateTrapezoidArea(require("fs").readFileSync("/dev/stdin", "utf8"));
