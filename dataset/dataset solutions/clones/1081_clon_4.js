const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');
const parsedLines = dataStream.trim().split('\n');

const totalNodes = Number(parsedLines.shift());

const structureRecords = new Array(totalNodes);
for (let i = 0; i < totalNodes; i++) {
  structureRecords[i] = {
    recordIndex: i,
    predecessor: null,
    descendantsList: [],
    levelValue: -1,
    category: ''
  };
}

const linkageDetails = parsedLines.map((s) => s.split(' ').map(Number));

linkageDetails.forEach((lineSegment) => {
  const currentParentId = lineSegment[0];
  const childIds = lineSegment.slice(2);

  childIds.forEach((currentChildId) => {
    structureRecords[currentChildId].predecessor = currentParentId;
    structureRecords[currentParentId].descendantsList.push(currentChildId);
  });
});

let initialNode = -1;
for (let i = 0; i < totalNodes; i++) {
  if (structureRecords[i].predecessor === null) {
    initialNode = i;
    break;
  }
}

const workQueue = [];
workQueue.push([initialNode, 0]);

while (workQueue.length > 0) {
  const [currentRecordIndex, currentLevel] = workQueue.shift();
  structureRecords[currentRecordIndex].levelValue = currentLevel;

  structureRecords[currentRecordIndex].descendantsList.forEach((descendantId) => {
    workQueue.push([descendantId, currentLevel + 1]);
  });
}

for (let i = 0; i < totalNodes; i++) {
  const currentRecord = structureRecords[i];
  if (currentRecord.predecessor === null) {
    currentRecord.category = 'root';
  } else if (currentRecord.descendantsList.length === 0) {
    currentRecord.category = 'leaf';
  } else {
    currentRecord.category = 'internal node';
  }
}

for (let i = 0; i < totalNodes; i++) {
  const recordToRender = structureRecords[i];
  const parentIdentifier = recordToRender.predecessor === null ? -1 : recordToRender.predecessor;
  const descendantIdentifiers = recordToRender.descendantsList.join(', ');

  console.log(
    'node ' + recordToRender.recordIndex + ': ' +
    [
      'parent = ' + parentIdentifier,
      'depth = ' + recordToRender.levelValue,
      recordToRender.category,
      '[' + descendantIdentifiers + ']',
    ].join(', ')
  );
}