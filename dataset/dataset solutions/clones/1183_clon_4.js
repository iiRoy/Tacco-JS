var inputBuffer = '';
process.stdin.resume();
process.stdin.setEncoding('utf-8');
process.stdin.on('data', function(chunk) {
  inputBuffer += chunk;
});

process.stdin.on('end', function() {
  var lines = inputBuffer.split('\n');
  var count = parseInt(lines[0], 10);
  var sourceCoords = lines[1].split(' ').map(Number);
  var targetCoords = lines[2].split(' ').map(Number);

  const absoluteDifferences = Array.from({ length: count }, (_, index) =>
    Math.abs(sourceCoords[index] - targetCoords[index])
  );

  const manhattanDistance = absoluteDifferences.reduce((accumulator, currentDifference) =>
    accumulator + currentDifference, 0
  );

  const squaredDifferencesSum = absoluteDifferences.reduce((accumulator, currentDifference) =>
    accumulator + (currentDifference * currentDifference), 0
  );
  const euclideanDistance = Math.sqrt(squaredDifferencesSum);

  const cubedDifferencesSum = absoluteDifferences.reduce((accumulator, currentDifference) =>
    accumulator + Math.pow(currentDifference, 3), 0
  );
  const minkowskiDistanceP3 = Math.pow(cubedDifferencesSum, 1/3);

  const chebyshevDistance = count === 0
    ? 0
    : absoluteDifferences.reduce((maximumValue, currentDifference) =>
        Math.max(maximumValue, currentDifference), 0
      );

  console.log(manhattanDistance);
  console.log(euclideanDistance);
  console.log(minkowskiDistanceP3);
  console.log(chebyshevDistance);
});
