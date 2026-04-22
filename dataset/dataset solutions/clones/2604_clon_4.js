const inputSource = process.stdin;
const outputSink = process.stdout;

let accumulatedContent = '';

inputSource.on('data', function(dataChunk) {
  accumulatedContent += dataChunk.toString();
});

inputSource.on('end', function() {
  const primaryLine = accumulatedContent.trim().split('\n')[0];
  const parsedQuantity = Number(primaryLine);

  const calculatedSum = (parsedQuantity * (parsedQuantity - 1)) / 2;

  outputSink.write(calculatedSum.toString() + '\n');
});

inputSource.on('error', (issue) => {
  outputSink.write('An input issue occurred: ' + issue.message + '\n');
  process.exit(1);
});