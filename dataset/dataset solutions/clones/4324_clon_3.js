"use strict";

const parsePersonRecordLine = (lineContent, fieldDelimiter = " ") => {
  const parts = lineContent.split(fieldDelimiter);
  const identifier = Number(parts[0]);
  const associatedValue = Number(parts[1]);
  return [identifier, associatedValue];
};

const updateDataStructures = (recordEntry, dataStoreMap, idCollection) => {
  const recordIdentifier = recordEntry[0];
  const recordValue = recordEntry[1];
  dataStoreMap.set(recordIdentifier, recordValue);
  idCollection.push(recordIdentifier);
};

const processInput = (inputString) => {
  const LINE_DELIMITER = "\n";
  let allInputLines = inputString.split(LINE_DELIMITER);

  // The first line contains a count, which is consumed but not used in the original logic.
  // We preserve the side effect of removing it from the array.
  const _initialRecordCount = allInputLines.shift(); 

  const parsedPersonRecords = allInputLines.map(line => parsePersonRecordLine(line));

  let personDataMap = new Map();
  let personIdentifiers = [];
  
  parsedPersonRecords.forEach((currentRecord) => {
    updateDataStructures(currentRecord, personDataMap, personIdentifiers);
  });

  const maximumIdentifier = Math.max(...personIdentifiers);
  const valueForMaxIdentifier = personDataMap.get(maximumIdentifier);
  
  const finalResult = maximumIdentifier + valueForMaxIdentifier;
  
  console.log(finalResult);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
