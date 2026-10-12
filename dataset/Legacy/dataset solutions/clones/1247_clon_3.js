const calculateAndFormatCircleProperties = (currentRadius) => {
  const PI_CONSTANT = Math.PI;
  const FORMAT_PRECISION = 5;

  const radiusSquaredValue = currentRadius * currentRadius;
  const computedArea = radiusSquaredValue * PI_CONSTANT;

  const diameterValue = 2 * currentRadius;
  const computedCircumference = diameterValue * PI_CONSTANT;

  const formattedAreaString = computedArea.toFixed(FORMAT_PRECISION);
  const formattedCircumferenceString = computedCircumference.toFixed(FORMAT_PRECISION);

  return formattedAreaString + ' ' + formattedCircumferenceString;
};

process.stdin.setEncoding('utf-8');
process.stdin.on('data', (receivedInputData) => {
  const inputSegments = receivedInputData.split(' ');
  const parsedRadius = parseInt(inputSegments[0]);

  const finalResultString = calculateAndFormatCircleProperties(parsedRadius);

  console.log(finalResultString);
});
