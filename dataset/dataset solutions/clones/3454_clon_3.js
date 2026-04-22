function formatNumberWithLeadingZeros(valToPad) {
  if (valToPad === null || valToPad === undefined) {
    return '000000';
  }

  let numericString = String(valToPad);
  return numericString.padStart(6, '0');
}

function processInputData(fullInputString) {
  const inputLines = fullInputString.split('\n');

  if (inputLines.length < 1) {
    console.error("Input data is empty or malformed.");
    return;
  }

  const headerParts = inputLines[0].split(' ');
  
  if (headerParts.length < 2) {
    console.error("Header line is malformed, expected two numbers.");
    return;
  }

  // The first number (N) is not used in the original logic, so we can omit it.
  const numEventsToProcess = parseInt(headerParts[1], 10);

  if (isNaN(numEventsToProcess) || numEventsToProcess < 0) {
    console.error("Invalid number of events specified in the input header.");
    return;
  }

  const eventDetailsList = [];

  for (let eventLineIndex = 1; eventLineIndex <= numEventsToProcess; eventLineIndex++) {
    const currentLine = inputLines[eventLineIndex];

    if (!currentLine) {
        console.warn(`Missing event data for line index ${eventLineIndex}. Skipping.`);
        continue;
    }

    const eventDataParts = currentLine.split(' ');
    
    if (eventDataParts.length < 2) {
      console.warn(`Malformed event data on line ${eventLineIndex}. Expected two values. Skipping.`);
      continue;
    }

    const prefectureIdentifier = parseInt(eventDataParts[0], 10);
    const eventCalendarYear = parseInt(eventDataParts[1], 10);

    if (isNaN(prefectureIdentifier) || isNaN(eventCalendarYear)) {
      console.warn(`Invalid numeric data detected on line ${eventLineIndex}. Skipping.`);
      continue;
    }

    eventDetailsList.push({
      prefectureIdentifier: prefectureIdentifier,
      originalInputSequence: eventLineIndex,
      eventCalendarYear: eventCalendarYear,
      rankWithinPrefecture: 0 
    });
  }

  eventDetailsList.sort((recordA, recordB) => {
    if (recordA.prefectureIdentifier !== recordB.prefectureIdentifier) {
      return recordB.prefectureIdentifier - recordA.prefectureIdentifier;
    }
    return recordB.eventCalendarYear - recordA.eventCalendarYear;
  });

  let currentRankCounter = 0;
  let lastProcessedPrefectureId = null;

  for (let i = 0; i < eventDetailsList.length; i++) {
    const currentRecord = eventDetailsList[i];

    if (i === 0 || currentRecord.prefectureIdentifier !== lastProcessedPrefectureId) {
      currentRankCounter = 1;
    } else {
      currentRankCounter++;
    }
    
    currentRecord.rankWithinPrefecture = currentRankCounter;
    lastProcessedPrefectureId = currentRecord.prefectureIdentifier;
  }

  const finalOutputIdentifiers = [];

  for (let i = 0; i < eventDetailsList.length; i++) {
    const record = eventDetailsList[i];
    
    const formattedPrefId = formatNumberWithLeadingZeros(record.prefectureIdentifier);
    const formattedRank = formatNumberWithLeadingZeros(record.rankWithinPrefecture);
    
    const combinedIdentifier = formattedPrefId + formattedRank;
    
    finalOutputIdentifiers.push(combinedIdentifier);
  }

  console.log(finalOutputIdentifiers.join('\n'));
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));