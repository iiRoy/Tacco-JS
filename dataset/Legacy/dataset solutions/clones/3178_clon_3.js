function processInput(rawData) {
  const parsedLines = rawData.split("\n");

  const initialConfig = parsedLines[0].split(" ").map(Number);
  const countA = initialConfig[0];
  const countB = initialConfig[1];
  const queryCount = initialConfig[2];

  let locationRecords = [];
  let currentLineIndex = 1;

  const createLocationRecord = (typeIdentifier, coordinateValue) => ({
    locationType: typeIdentifier,
    locationCoord: coordinateValue,
    minDistanceToOtherType: Number.MAX_VALUE
  });

  for (let k = 0; k < countA; k++, currentLineIndex++) {
    locationRecords.push(createLocationRecord(1, Number(parsedLines[currentLineIndex])));
  }
  for (let k = 0; k < countB; k++, currentLineIndex++) {
    locationRecords.push(createLocationRecord(2, Number(parsedLines[currentLineIndex])));
  }

  let lastSeenType1 = null;
  let lastSeenType2 = null;

  locationRecords.sort((rec1, rec2) => rec1.locationCoord - rec2.locationCoord);

  locationRecords.forEach(currentRecord => {
    if (currentRecord.locationType === 1) {
      if (lastSeenType2) {
        const calculatedDistance = currentRecord.locationCoord - lastSeenType2.locationCoord;
        lastSeenType2.minDistanceToOtherType = Math.min(lastSeenType2.minDistanceToOtherType, calculatedDistance);
        currentRecord.minDistanceToOtherType = calculatedDistance;
      }
      lastSeenType1 = currentRecord;
    } else {
      if (lastSeenType1) {
        const calculatedDistance = currentRecord.locationCoord - lastSeenType1.locationCoord;
        lastSeenType1.minDistanceToOtherType = Math.min(lastSeenType1.minDistanceToOtherType, calculatedDistance);
        currentRecord.minDistanceToOtherType = calculatedDistance;
      }
      lastSeenType2 = currentRecord;
    }
  });

  for (let j = 0; j < queryCount; j++, currentLineIndex++) {
    const queryCoordinate = Number(parsedLines[currentLineIndex]);
    const searchResultIndex = findInsertionPoint(locationRecords, queryCoordinate);

    let finalAnswer = 0;
    const totalRecords = locationRecords.length;

    if (searchResultIndex < 0) {
      const firstAvailableRecord = locationRecords[0];
      finalAnswer = Math.abs(firstAvailableRecord.locationCoord - queryCoordinate) + firstAvailableRecord.minDistanceToOtherType;
    } else if (searchResultIndex >= totalRecords - 1) {
      const lastAvailableRecord = locationRecords[totalRecords - 1];
      finalAnswer = Math.abs(lastAvailableRecord.locationCoord - queryCoordinate) + lastAvailableRecord.minDistanceToOtherType;
    } else {
      const recordAtOrBefore = locationRecords[searchResultIndex];
      const recordAfter = locationRecords[searchResultIndex + 1];

      const distanceOption1 = Math.abs(recordAtOrBefore.locationCoord - queryCoordinate) + recordAtOrBefore.minDistanceToOtherType;
      const distanceOption2 = Math.abs(recordAfter.locationCoord - queryCoordinate) + recordAfter.minDistanceToOtherType;

      finalAnswer = Math.min(distanceOption1, distanceOption2);
    }
    console.log(finalAnswer);
  }
  return locationRecords;
}

function findInsertionPoint(records, targetCoord) {
  let lowIdx = 0;
  let highIdx = records.length;
  let currentMidIdx = Math.floor((lowIdx + highIdx) / 2);

  while (lowIdx < highIdx) {
    if (records[currentMidIdx].locationCoord > targetCoord) {
      highIdx = currentMidIdx - 1;
    } else {
      lowIdx = currentMidIdx + 1;
    }
    currentMidIdx = Math.floor((lowIdx + highIdx) / 2);
  }

  if (records[currentMidIdx] && records[currentMidIdx].locationCoord > targetCoord) {
    return currentMidIdx - 1;
  } else {
    return currentMidIdx;
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
