/*
 * This program is designed to gather information
 * from the standard input stream until it concludes.
 */
let receivedTextBuffer = '';

process
  .stdin
  .resume();

process.stdin.setEncoding(
  'utf8'
);

process
  .stdin
  .on('data',
    function(incomingSegment) {
      receivedTextBuffer += incomingSegment;
    }
  );

process
  .stdin
  .on('end',
    function() {
      // Once all data has been received, perform the final transformation.
      console.log(
        receivedTextBuffer.replace('FirstString', 'SecondString')
      );
    }
  );