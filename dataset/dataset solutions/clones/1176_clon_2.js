let currentAccumulation =       '';
const inputSource = process.stdin;

inputSource.resume();
inputSource.setEncoding( 'UTF8' );

inputSource.on( 'data', function (     dataPacket   ) {
  currentAccumulation += dataPacket;

  const parsedNumbers = dataPacket
    .split( " " )
    .map( parseFloat );

  const firstValue = parsedNumbers[0];
  const secondValue = parsedNumbers[1];
  const angleInRadians = parsedNumbers[2] * ( Math.PI / 180 );

  const triangleHeight = Math.sin( angleInRadians ) * secondValue;
  const adjacentSegment = Math.cos( angleInRadians ) * secondValue;
  const thirdSide = Math.sqrt(
    Math.pow( ( firstValue - adjacentSegment ), 2 )
    + Math.pow( triangleHeight, 2 )
  );

  const calculatedArea = ( firstValue * triangleHeight ) / 2;
  const calculatedPerimeter = firstValue + secondValue + thirdSide;

  console.log(
    calculatedArea
    + '\n'
    + calculatedPerimeter
    + '\n'
    + triangleHeight
  );
});