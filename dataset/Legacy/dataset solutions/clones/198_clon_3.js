const BLOOD_TYPE_DELIMITER = ',';
const INITIAL_BLOOD_GROUP_STRUCTURE = {
  A: 0,
  B: 0,
  AB: 0,
  O: 0,
};

function createFreshBloodGroupTallies() {
  return Object.assign({}, INITIAL_BLOOD_GROUP_STRUCTURE);
}

function processSingleRecordLine(currentRecordLine, bloodGroupTallies) {
  const trimmedRecord = currentRecordLine.trim();

  if (trimmedRecord.length === 0) {
    return;
  }

  const recordSegments = trimmedRecord.split(BLOOD_TYPE_DELIMITER);
  const bloodTypeKey = recordSegments[1];

  bloodGroupTallies[bloodTypeKey]++;
}

function processInputData() {
  let bloodGroupTallies = createFreshBloodGroupTallies();

  const allInputLines = receivedDataBuffer.split('\n');

  allInputLines.forEach(function(lineItem) {
    processSingleRecordLine(lineItem, bloodGroupTallies);
  });

  console.log(bloodGroupTallies.A);
  console.log(bloodGroupTallies.B);
  console.log(bloodGroupTallies.AB);
  console.log(bloodGroupTallies.O);
}

let receivedDataBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(incomingDataChunk) {
  receivedDataBuffer += incomingDataChunk;
});
process.stdin.on('end', function() {
  processInputData();
});
