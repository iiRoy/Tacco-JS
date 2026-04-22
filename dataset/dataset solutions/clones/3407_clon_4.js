const inputSource = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });

const holidayMessages = {
  "22": "Christmas Eve Eve Eve",
  "23": "Christmas Eve Eve",
  "24": "Christmas Eve",
  "25": "Christmas"
};

function displaySeasonalGreeting(inputKey) {
  const outputMessage = holidayMessages[inputKey];
  if (outputMessage !== undefined) {
    console.log(outputMessage);
  }
}

displaySeasonalGreeting(inputSource);