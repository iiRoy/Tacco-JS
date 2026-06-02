function getMaximumValue(valueCollection) {
  let maxValueFound = Number.NEGATIVE_INFINITY;
  valueCollection.forEach(currentValue => {
    if (maxValueFound < currentValue) {
      maxValueFound = currentValue;
    }
  });
  return maxValueFound;
}

function processDataStream(streamContent) {
  const contentLines = streamContent.split('\n');

  const parseNumericRow = (line) => line.split(' ').map(valStr => parseInt(valStr, 10));
  const numericDataRows = contentLines.map(parseNumericRow);

  const configurationTuple = numericDataRows.shift();
  const totalEntries = configurationTuple[0];
  const channelCount = configurationTuple[1];

  const MAX_TIME_BOUNDARY = 200002;
  const channelActivityMarkers = new Array(MAX_TIME_BOUNDARY);
  const cumulativeRecorderCounts = new Array(MAX_TIME_BOUNDARY);
  cumulativeRecorderCounts.fill(0);

  for (let currentChannel = 1; currentChannel <= channelCount; currentChannel++) {
    channelActivityMarkers.fill(0);

    for (let dataRowIndex = 0; dataRowIndex < totalEntries; dataRowIndex++) {
      const currentEntry = numericDataRows[dataRowIndex];
      const entryChannel = currentEntry[2];

      if (entryChannel === currentChannel) {
        const startTimePoint = currentEntry[0] * 2 - 1;
        const endTimePoint = currentEntry[1] * 2;
        channelActivityMarkers[startTimePoint]++;
        channelActivityMarkers[endTimePoint]--;
      }
    }

    for (let timeMarkerIndex = 1; timeMarkerIndex < MAX_TIME_BOUNDARY; timeMarkerIndex++) {
      channelActivityMarkers[timeMarkerIndex] = channelActivityMarkers[timeMarkerIndex - 1] + channelActivityMarkers[timeMarkerIndex];
    }

    for (let timeMarkerIndex = 1; timeMarkerIndex < MAX_TIME_BOUNDARY; timeMarkerIndex++) {
      cumulativeRecorderCounts[timeMarkerIndex] += channelActivityMarkers[timeMarkerIndex];
    }
  }

  console.log(getMaximumValue(cumulativeRecorderCounts));
}

processDataStream(require('fs').readFileSync('/dev/stdin', 'utf8'));
