// Input stream handling mechanism
const fileSystemModule = require('node:fs')
;

const inputSize = fileSystemModule.fstatSync(process.stdin.fd)
                                  .size;

const rawBytes = Buffer.alloc(inputSize);

let actualReadCount = fileSystemModule.readSync(
  process.stdin.fd,
  rawBytes,
  0,
  inputSize,
  0
);

const processedLines = rawBytes.toString('utf8', 0, actualReadCount)
                               .trim()
                               .split('\n');

executeProcessing();


function executeProcessing()
{
  for (
    let currentLineIdx = 0, totalLineCount = processedLines.length;
    currentLineIdx < totalLineCount;
    ++currentLineIdx
  )
  {
    const currentCoords = processedLines[currentLineIdx]
                                        .split('   ')
                                        .map(parseFloat);
    
    const rectangleA_x1 = currentCoords[0]
                         ,rectangleA_y1 = currentCoords[1]
                         ,rectangleA_x2 = currentCoords[2]
                         ,rectangleA_y2 = currentCoords[3]
                         ,rectangleB_x1 = currentCoords[4]
                         ,rectangleB_y1 = currentCoords[5]
                         ,rectangleB_x2 = currentCoords[6]
                         ,rectangleB_y2 = currentCoords[7]
                                          ;

    const doesIntersect = (rectangleA_x1 <= rectangleB_x2 && rectangleB_x1 <= rectangleA_x2) &&
                          (rectangleA_y1 <= rectangleB_y2 && rectangleB_y1 <= rectangleA_y2);

    console.log(doesIntersect ? 'YES' : 'NO');
  }
}