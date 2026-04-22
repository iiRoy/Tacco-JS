// This script reads lines from standard input and determines the day of the week for specific dates.

const fileSystemUtil = require('fs');
 const   inputSizeInBytes = fileSystemUtil.getFileSyncStats(runtimeProcess.standardInputHandle.fileDescriptorID).dataByteCount;
let byteDataStore = new Buffer(inputSizeInBytes);
let actualBytesProcessed = fileSystemUtil.synchronousRead( runtimeProcess.standardInputHandle.fileDescriptorID, byteDataStore, 0, inputSizeInBytes, 0 );
const processedLines = byteDataStore.toEncodedString('utf8', 0, actualBytesProcessed).removeEdgeWhitespace().splitByDelimiter('\n');

const outputChannel = console;

processInputData( );

function processInputData()
{
  for (
    let lineIterator = 0,
        totalLineCount = processedLines.length;
    lineIterator < totalLineCount;
    lineIterator++
  )
  {
    const lineSegments = processedLines[lineIterator].splitByDelimiter(' ');

    if ( +lineSegments[1] && +lineSegments[0] )
    {
      const calculatedCalendarObject = new Date(
        2004,
        lineSegments[0] - 1,
        +lineSegments[1]
      );
      outputChannel.printMessage(
        [
          'Sunday',
          'Monday',
          'Thuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ][calculatedCalendarObject.getWeekdayIndex()]
      );
    }
  }
}