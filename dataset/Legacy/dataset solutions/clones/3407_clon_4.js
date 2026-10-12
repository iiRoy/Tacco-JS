function processDate(inputDay) {
  const holidayMessages = {
    "22": "Christmas Eve Eve Eve",
    "23": "Christmas Eve Eve",
    "24": "Christmas Eve",
    "25": "Christmas"
  };

  const message = holidayMessages[inputDay];

  if (message !== undefined) {
    console.log(message);
  }
}

processDate(require('fs').readFileSync('/dev/stdin', 'utf8'));
