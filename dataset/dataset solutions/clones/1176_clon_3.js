let accumulatedInput = '';

const DEG_TO_RAD_FACTOR = Math.PI / 180;

const square = (num) => num * num;

const inputStream = process.stdin;
inputStream.resume();
inputStream.setEncoding('utf-8');

inputStream.on('data', function(dataChunk) {
  accumulatedInput += dataChunk;

  const numberStrings = dataChunk.split(" ");
  const parsedNumbers = numberStrings.map(Number);

  const sideA = parsedNumbers[0];
  const sideB = parsedNumbers[1];
  const angleC_degrees = parsedNumbers[2];
  const angleC_radians = angleC_degrees * DEG_TO_RAD_FACTOR;
  
  const heightVal = Math.sin(angleC_radians) * sideB;
  const adjacentProjection = Math.cos(angleC_radians) * sideB;
  
  const baseDifference = sideA - adjacentProjection;
  const sideC = Math.sqrt(square(baseDifference) + square(heightVal));
  
  const areaTriangle = (sideA * heightVal) / 2;
  const perimeterTriangle = sideA + sideB + sideC;

  console.log(`${areaTriangle}\n${perimeterTriangle}\n${heightVal}`);
});
