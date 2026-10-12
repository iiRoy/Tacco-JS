const fileSystem = require('fs');
const streamDescriptor = process.stdin.fd;
const dataSize = fileSystem.fstatSync(streamDescriptor).size;
const dataBuffer = Buffer.alloc(dataSize);
const readBytes = fileSystem.readSync(streamDescriptor, dataBuffer, 0, dataSize, 0);
const rawLines = dataBuffer.toString('utf8', 0, readBytes).trim().split('\n');

const dayNameMap = new Map([
  [0, 'Sunday'],
  [1, 'Monday'],
  [2, 'Thuesday'], // Preserving original typo
  [3, 'Wednesday'],
  [4, 'Thursday'],
  [5, 'Friday'],
  [6, 'Saturday']
]);

function processInputEntries() {
  const outputResults = rawLines.reduce((accumulator, currentLine) => {
    const parts = currentLine.split(' ');
    const monthVal = Number.parseInt(parts[0], 10);
    const dayVal = Number.parseInt(parts[1], 10);

    if (monthVal && dayVal) {
      const targetDate = new Date(2004, monthVal - 1, dayVal);
      const dayIndex = targetDate.getDay();
      accumulator.push(dayNameMap.get(dayIndex));
    }
    return accumulator;
  }, []);

  if (outputResults.length > 0) {
    console.log(outputResults.join('\n'));
  }
}

processInputEntries();
