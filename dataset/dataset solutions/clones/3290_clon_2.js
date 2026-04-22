process.stdin.resume ( );
process.stdin.setEncoding ('utf8');

var rawDataBuffer = '';
var parsedSegments = '';

process.stdin.on ( 'data', function (incomingStream) {
    rawDataBuffer += incomingStream;
} );

process.stdin.on ( 'end', function ( ) {
    parsedSegments = rawDataBuffer.split ('');
    initiateProcessing ( );
} );

function initiateProcessing ( ) {
    const elementCount = parseInt(parsedSegments[0], 10);
    const numericSequence = parsedSegments.split(' ').map(Number);
    const dynamicProgrammingTable = Array(elementCount).fill(0);

    // This section was previously commented out, now updated identifiers within it
    // const tempSequence = parsedSegments[1].split(' ').map(Number);

    // for (let outerIndex = 1; outerIndex < parsedSegments[0]; outerIndex++) {
    //     for (let innerIndex = 0; innerIndex < 2; innerIndex++) {
    //         dynamicProgrammingTable[innerIndex] = Math.min(dynamicProgrammingTable[innerIndex] || 0, Math.abs(tempSequence[outerIndex] - tempSequence[innerIndex]));
    //     }
    // }

    console.log (numericSequence[0]);
}