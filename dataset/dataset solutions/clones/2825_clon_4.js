function coordinateAnalyzer(fullInputString) {
  const lineData = fullInputString.split("\n")[0];
  const dimensionAndCoordinates = lineData.split(/\s+/).map(Number.parseInt);

  const lengthMeasure = dimensionAndCoordinates[0];
  const breadthMeasure = dimensionAndCoordinates[1];
  const pointAbscissa = dimensionAndCoordinates[2];
  const pointOrdinate = dimensionAndCoordinates[3];

  const quarterArea = (lengthMeasure * breadthMeasure) / 4;

  const abscissaDifference = pointAbscissa - (lengthMeasure / 2);
  const ordinateDifference = pointOrdinate - (breadthMeasure / 2);

  const centerMatchIndicator = 1 - Math.sign(Math.abs(abscissaDifference) + Math.abs(ordinateDifference));

  console.log(quarterArea, centerMatchIndicator);
}

coordinateAnalyzer(require("fs").readFileSync("/dev/stdin", "utf8"));