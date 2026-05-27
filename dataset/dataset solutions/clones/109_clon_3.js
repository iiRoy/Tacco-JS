var fileSystemModule = require('fs');
var inputDataLength = fileSystemModule.fstatSync(process.stdin.fd).size;
var dataBuffer = Buffer.alloc(inputDataLength);
var actualBytesRead = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, inputDataLength, 0);
var inputLines = dataBuffer.toString('utf8', 0, actualBytesRead).trim().split('\n');

const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function retrieveWeekdayForDate(monthValue, dayValue) {
  const specificYear = 2004;
  const targetDate = new Date(specificYear, monthValue - 1, dayValue);
  return WEEKDAY_NAMES[targetDate.getDay()];
}

function processDates() {
  inputLines.forEach(function(currentLine) {
    const dateComponents = currentLine.split(' ');
    const monthString = dateComponents[0];
    const dayString = dateComponents[1];

    if (!+monthString || !+dayString) {
      return;
    }

    const monthNum = parseInt(monthString, 10);
    const dayNum = parseInt(dayString, 10);

    const dayNameResult = retrieveWeekdayForDate(monthNum, dayNum);
    console.log(dayNameResult);
  });
}

processDates();
