const fileSystem = require('fs');
const dataSize = fileSystem.fstatSync(process.stdin.fd).size;
const dataBuffer = Buffer.alloc(dataSize);
const readBytes = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, dataSize, 0);
const inputLines = dataBuffer.toString('utf8', 0, readBytes).trim().split('\n');

const processRectangles = () => {
  inputLines.forEach(currentLineData => {
    const numericValues = currentLineData.split(' ').map(Number);

    const rectA = {
      left: numericValues[0],
      bottom: numericValues[1],
      right: numericValues[2],
      top: numericValues[3]
    };

    const rectB = {
      left: numericValues[4],
      bottom: numericValues[5],
      right: numericValues[6],
      top: numericValues[7]
    };

    const isSeparated = (
      rectA.right < rectB.left ||
      rectB.right < rectA.left ||
      rectA.top < rectB.bottom ||
      rectB.top < rectA.bottom
    );

    const overlapStatus = !isSeparated;

    console.log(overlapStatus ? 'YES' : 'NO');
  });
};

processRectangles();
