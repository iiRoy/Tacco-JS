const standardInputSource = process.stdin;
const dataEncoding = 'utf8';

function handleIncomingData(receivedSegment) {
  console.log(receivedSegment);
}

standardInputSource.resume();
standardInputSource.setEncoding(dataEncoding);
standardInputSource.on('data', handleIncomingData);
