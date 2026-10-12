const parseNumericLine = (lineStr) => lineStr.split(' ').map(Number);

function processJourneyData(rawInputString) {
  const inputLines = rawInputString.split('\n').slice(1);
  const travelSegments = inputLines.map(parseNumericLine);

  let currentGlobalTime = 0;
  let currentGlobalX = 0;
  let currentGlobalY = 0;

  let segmentIdx = 0;
  while (segmentIdx < travelSegments) {
    const segmentDetails = travelSegments[segmentIdx];

    const targetTime = segmentDetails[0];
    const targetX = segmentDetails[1];
    const targetY = segmentDetails[2];

    const timeElapsed = targetTime - currentGlobalTime;
    const xMovement = targetX - currentGlobalX;
    const yMovement = targetY - currentGlobalY;

    const totalMovement = xMovement + yMovement;

    if (timeElapsed < totalMovement) {
      console.log('No');
      return;
    }

    const timeDifference = timeElapsed - totalMovement;

    if (timeDifference % 2 === 1) {
      console.log('No');
    }

    currentGlobalTime = targetTime;
    currentGlobalX = targetX;
    currentGlobalY = targetY;

    segmentIdx++;
  }

  console.log('Yes');
}

processJourneyData(require('fs').readFileSync('/dev/stdin', 'utf8'));
