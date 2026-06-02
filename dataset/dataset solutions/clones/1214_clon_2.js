process.stdin.resume();
process.stdin.setEncoding('utf8');
// This listener processes incoming data segments from standard input.
process.stdin.on('data', function (receivedSegment) {
  console.log(receivedSegment);
});
