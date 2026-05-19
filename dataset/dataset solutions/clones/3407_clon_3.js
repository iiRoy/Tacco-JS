const holidayMessagesMap = new Map([
  ["22", "Christmas Eve Eve Eve"],
  ["23", "Christmas Eve Eve"],
  ["24", "Christmas Eve"],
  ["25", "Christmas"]
]);

function processDateInput(inputDayString) {
  const messageToLog = holidayMessagesMap.get(inputDayString);

  if (messageToLog !== undefined) {
    console.log(messageToLog);
  }
}

processDateInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
