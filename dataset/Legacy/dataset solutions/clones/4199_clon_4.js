function findPeak(valueCollection) {
  return valueCollection.reduce((currentMax, currentVal) => Math.max(currentMax, currentVal), -Infinity);
}

function processInputData(rawData) {
  const dataRows = rawData.split('\n');

  const [recordCount, channelCount] = dataRows[0].split(' ').map(Number);

  const parsedRecords = dataRows.slice(1).map(row => row.split(' ').map(Number));

  const eventList = [];
  const maxTimeIndex = 200001;

  for (const record of parsedRecords) {
    const [startTime, endTime, channelIdentifier] = record;
    eventList.push({ moment: startTime * 2 - 1, change: 1 });
    eventList.push({ moment: endTime * 2, change: -1 });
  }

  eventList.sort((a, b) => {
    if (a.moment !== b.moment) {
      return a.moment - b.moment;
    }
    return b.change - a.change;
  });

  const totalActiveAtTime = Array(maxTimeIndex + 1).fill(0);
  let currentActiveCount = 0;
  let lastProcessedMoment = 0;

  for (const event of eventList) {
    const currentMoment = event.moment;
    const deltaValue = event.change;

    for (let fillIndex = lastProcessedMoment; fillIndex < currentMoment; fillIndex++) {
      if (fillIndex >= 0 && fillIndex <= maxTimeIndex) {
        totalActiveAtTime[fillIndex] = currentActiveCount;
      }
    }

    currentActiveCount += deltaValue;
    lastProcessedMoment = currentMoment;
  }

  for (let fillIndex = lastProcessedMoment; fillIndex <= maxTimeIndex; fillIndex++) {
    if (fillIndex >= 0 && fillIndex <= maxTimeIndex) {
      totalActiveAtTime[fillIndex] = currentActiveCount;
    }
  }

  console.log(findPeak(totalActiveAtTime));
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
