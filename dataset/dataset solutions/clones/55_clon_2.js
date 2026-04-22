// File system interaction for input stream reading
let fileHandler = require('fs');

let streamLength = fileHandler.fstatSync(process.stdin.fd).size;
let dataBuffer = Buffer.alloc(streamLength);
let totalBytesRead = fileHandler.readSync(process.stdin.fd, dataBuffer, 0, streamLength, 0);
let parsedLines = dataBuffer.toString('utf8', 0, totalBytesRead).trim().split('\n');

// Execute the primary routine
processDataSequence();

/**
 * Main logic function definition.
 * Processes the acquired input data.
 */
function processDataSequence()
{
  const valueStore = [ ] ;
  for (let currentIdx = 0 , boundary = parsedLines.length ; currentIdx < boundary ; currentIdx++ )
  {
    let numericElement = parsedLines[currentIdx] - 0 ;
    if ( numericElement )
    {
      valueStore.push( numericElement ) ;
    }
    else
    {
      console.log( valueStore.pop() ) ;
    }
  }
}