const auxiliaryIO = require('readline');

const processingInterface = auxiliaryIO.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const PI_CONSTANT_VALUE = Math.PI;

const deriveCircleProperties = (radialMeasurement) => {
  const parsedMeasurement = Number(radialMeasurement);

  const calculatedArea = PI_CONSTANT_VALUE * Math.pow(parsedMeasurement, 2);
  const calculatedCircumference = 2 * PI_CONSTANT_VALUE * parsedMeasurement;

  return { area: calculatedArea, circumference: calculatedCircumference };
};

processingInterface.on('line', (dataFeed) => {
  const primaryDatum = dataFeed.trim().split(' ')[0];
  const { area, circumference } = deriveCircleProperties(primaryDatum);

  const formattedArea = area.toFixed(5);
  const formattedCircumference = circumference.toFixed(5);

  process.stdout.write(`${formattedArea} ${formattedCircumference}\n`);
});