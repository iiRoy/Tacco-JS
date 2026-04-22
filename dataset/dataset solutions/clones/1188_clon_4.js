let entirePayload = "";

process.stdin.resume();
process.stdin.setEncoding('utf-8');

process.stdin.on('data', function(dataSegment) {
  entirePayload += dataSegment;
});

process.stdin.on('end', function() {
  const parsedLines = entirePayload.split("\n");

  const initialConfiguration = parsedLines[0].split(' ').map(s => +s);
  const moveSequence = parsedLines[1].split('');

  // Mapping of faces: 0:apex, 1:vanguard, 2:dexter, 3:sinister, 4:rearward, 5:nadir
  // Original mapping: top, front, right, left, back, bottom

  const kineticAdjustments = {
    'E': (currentArr) => [currentArr[3], currentArr[1], currentArr[0], currentArr[5], currentArr[4], currentArr[2]], // East: apex -> sinister -> nadir -> dexter -> apex
    'N': (currentArr) => [currentArr[1], currentArr[5], currentArr[2], currentArr[3], currentArr[0], currentArr[4]], // North: apex -> vanguard -> nadir -> rearward -> apex
    'S': (currentArr) => [currentArr[4], currentArr[0], currentArr[2], currentArr[3], currentArr[5], currentArr[1]], // South: apex -> rearward -> nadir -> vanguard -> apex
    'W': (currentArr) => [currentArr[2], currentArr[1], currentArr[5], currentArr[0], currentArr[4], currentArr[3]], // West: apex -> dexter -> nadir -> sinister -> apex
  };

  const finalState = moveSequence.reduce((currentFaces, movementChar) => {
    const transformationFunction = kineticAdjustments[movementChar];
    return transformationFunction(currentFaces);
  }, initialConfiguration);

  console.log(finalState[0]); // Output the value of the apex face
});