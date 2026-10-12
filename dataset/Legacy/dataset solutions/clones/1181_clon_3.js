var inputBuffer = '';
var inputSource = process.stdin;
inputSource.resume();
inputSource.setEncoding('utf-8');

inputSource.on('data', function(receivedChunk) {
  inputBuffer += receivedChunk;
});

inputSource.on('end', function() {
  const LINE_DELIMITER = '\n';
  const VALUE_DELIMITER = ' ';
  const SQRT_EXPONENT = 0.5; // Represents 1/2 for square root
  const CUBE_ROOT_EXPONENT = 1 / 3; // Represents 1/3 for cube root

  var processedLines = inputBuffer.split(LINE_DELIMITER);
  var itemCount = Number.parseInt(processedLines[0]);
  var coordsX = processedLines[1].split(VALUE_DELIMITER).map(val => Number(val));
  var coordsY = processedLines[2].split(VALUE_DELIMITER).map(val => Number(val));

  var l1NormSum = 0;
  var l2NormSquaredSum = 0;
  var l3NormPowerSum = 0;
  var lInfinityNorm = 0;
  var absoluteDifferences = [];

  for (var currentIndex = 0; currentIndex < itemCount; currentIndex++) {
    const currentX = coordsX[currentIndex];
    const currentY = coordsY[currentIndex];
    const difference = currentX - currentY;
    const currentAbsDiff = Math.abs(difference);
    
    absoluteDifferences.push(currentAbsDiff);

    l1NormSum += currentAbsDiff;
    
    const squaredAbsDiff = currentAbsDiff * currentAbsDiff;
    l2NormSquaredSum += squaredAbsDiff;
    
    const cubedAbsDiff = squaredAbsDiff * currentAbsDiff;
    l3NormPowerSum += cubedAbsDiff;
    
    lInfinityNorm = Math.max(lInfinityNorm, currentAbsDiff);
  }

  console.log(l1NormSum);
  console.log(Math.pow(l2NormSquaredSum, SQRT_EXPONENT));
  console.log(Math.pow(l2NormSquaredSum, CUBE_ROOT_EXPONENT));
  console.log(lInfinityNorm);
});
