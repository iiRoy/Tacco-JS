process.stdin.setEncoding('utf-8');

const calculateGeometricProperties = (radiusValue) => {
  const PI_CONSTANT = Math.PI;
  const squaredRadius = Math.pow(radiusValue, 2);
  const areaResult = squaredRadius * PI_CONSTANT;
  const circumferenceResult = PI_CONSTANT * 2 * radiusValue;
  return { area: areaResult, circumference: circumferenceResult };
};

process.stdin.on('data', (incomingData) => {
  const [radiusStringSegment] = incomingData.split(' ');
  const numericRadius = parseInt(radiusStringSegment, 10);

  const { area, circumference } = calculateGeometricProperties(numericRadius);

  const formattedParts = [area, circumference].map(
    (valueToFormat) => valueToFormat.toFixed(5)
  );

  console.log(formattedParts.join(' '));
});
