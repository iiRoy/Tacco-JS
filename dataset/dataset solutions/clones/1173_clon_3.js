process.stdin.resume();
process.stdin.setEncoding('utf8');

const PI_CONSTANT = Math.PI;
const DEGREE_TO_RADIAN_CONVERSION_FACTOR = PI_CONSTANT / 180.0;
const HALF_VALUE = 0.5;
const TWO_VALUE = 2.0;

const convertDegreesToRadians = (degreesInput) => {
  return degreesInput * DEGREE_TO_RADIAN_CONVERSION_FACTOR;
};

process.stdin.on('data', function (receivedChunk) {
  const inputTokens = receivedChunk.split(" ");

  const sideOne = parseFloat(inputTokens[0]);
  const sideTwo = parseFloat(inputTokens[1]);
  const angleInDegrees = parseFloat(inputTokens[2]);
  
  const angleInRadians = convertDegreesToRadians(angleInDegrees);
  
  const calculatedArea = HALF_VALUE * sideOne * sideTwo * Math.sin(angleInRadians);
  
  const sideThreeSquared = Math.pow(sideOne, TWO_VALUE) + Math.pow(sideTwo, TWO_VALUE) - TWO_VALUE * sideOne * sideTwo * Math.cos(angleInRadians);
  const sideThreeLength = Math.sqrt(sideThreeSquared);
  
  const totalPerimeter = sideOne + sideTwo + sideThreeLength;
  
  const heightRelativeToSideOne = (TWO_VALUE * calculatedArea) / sideOne;

  console.log(calculatedArea);
  console.log(totalPerimeter);
  console.log(heightRelativeToSideOne);
});
