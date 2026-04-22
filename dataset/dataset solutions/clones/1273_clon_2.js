function processInputData()
{
  var tokenSequence = receivedPayload[1].split(' ');
  tokenSequence.reverse();
  var resultText = tokenSequence.join(' ');

  console.log(resultText);
}

var
  receivedPayload = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataSegment)
{
  receivedPayload += dataSegment;
});
process.stdin.on('end', function()
{
  receivedPayload = receivedPayload.split('\n');
  processInputData();
});