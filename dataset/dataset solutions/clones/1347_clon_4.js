const interfaceModule = require('readline');

const circularRatio = 3.141592653589793;

async function processGeometricQuantities() {
  const lineReader = interfaceModule.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  let radiusMeasurement;

  for await (const inputLine of lineReader) {
    radiusMeasurement = Number(inputLine);
    break;
  }

  lineReader.close();

  const calculatePerimeter = (val) => 2 * val * circularRatio;
  const calculatePlanarExtent = (val) => val * val * circularRatio;

  const perimeterResult = calculatePerimeter(radiusMeasurement);
  const planarExtentResult = calculatePlanarExtent(radiusMeasurement);

  const outputString = `${perimeterResult} ${planarExtentResult}\n`;
  process.stdout.write(outputString);
}

processGeometricQuantities();