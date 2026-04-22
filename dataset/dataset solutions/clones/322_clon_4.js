const fileSystemModule = require('fs');

let entirePayload;
try {
  entirePayload = fileSystemModule.readFileSync(0, 'utf8');
} catch (issue) {
  entirePayload = '';
}

const originalSequence = 'Hoshino';
const newSequence = 'Hoshina';

let modifiedPayload;
const matchPosition = entirePayload.indexOf(originalSequence);

if (matchPosition !== -1) {
  const initialSegment = entirePayload.slice(0, matchPosition);
  const trailingSegment = entirePayload.slice(matchPosition + originalSequence.length);
  modifiedPayload = initialSegment + newSequence + trailingSegment;
} else {
  modifiedPayload = entirePayload;
}

process.stdout.write(modifiedPayload + '\n');