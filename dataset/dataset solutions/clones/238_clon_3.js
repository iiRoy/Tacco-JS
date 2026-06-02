const fileSystemModule = require('fs');

function readStandardInput() {
  const inputDescriptor = process.stdin.fd;
  const inputStats = fileSystemModule.fstatSync(inputDescriptor);
  const totalInputSize = inputStats.size;

  const inputDataBuffer = Buffer.alloc(totalInputSize);
  
  const bytesActuallyRead = fileSystemModule.readSync(inputDescriptor, inputDataBuffer, 0, totalInputSize, 0);
  
  return inputDataBuffer.toString('utf8', 0, bytesActuallyRead).trim().split('\n');
}

function doRectanglesIntersect(rectangleOne, rectangleTwo) {
  const xOverlapCondition = (rectangleOne.x1 <= rectangleTwo.x2 && rectangleTwo.x1 <= rectangleOne.x2);
  const yOverlapCondition = (rectangleOne.y1 <= rectangleTwo.y2 && rectangleTwo.y1 <= rectangleOne.y2);
  
  return xOverlapCondition && yOverlapCondition;
}

function processInputData() {
  const allInputLines = readStandardInput();

  for (const currentLine of allInputLines) {
    const numericCoordinates = currentLine.split(' ').map(Number);
    
    const rectangleA = {
      x1: numericCoordinates[0],
      y1: numericCoordinates[1],
      x2: numericCoordinates[2],
      y2: numericCoordinates[3]
    };
    
    const rectangleB = {
      x1: numericCoordinates[4],
      y1: numericCoordinates[5],
      x2: numericCoordinates[6],
      y2: numericCoordinates[7]
    };

    const intersectionResult = doRectanglesIntersect(rectangleA, rectangleB);

    console.log(intersectionResult ? 'YES' : 'NO');
  }
}

processInputData();
