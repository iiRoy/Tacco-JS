const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputProcessor.on('line', function(receivedLine) {
  handleDateCalculation(receivedLine);
});

function isComponentValid(value, minBound, maxBound) {
  return value >= minBound && value <= maxBound;
}

function handleDateCalculation(dateInputString) {
  const delimiter = ' ';
  var dateParts = dateInputString.split(delimiter);

  var startMonth = parseInt(dateParts[0], 10);
  var dayThreshold = parseInt(dateParts[1], 10);

  var calculatedMatchCount = 0;

  const isMonthValueValid = isComponentValid(startMonth, 1, 12);
  const isDayValueValid = isComponentValid(dayThreshold, 1, 31);

  if (!isMonthValueValid || !isDayValueValid) {
    return console.log(calculatedMatchCount);
  }

  let currentMonthIteration = startMonth;

  while (currentMonthIteration > 0) {
    const isCurrentMonthWithinDayThreshold = currentMonthIteration <= dayThreshold;
    if (isCurrentMonthWithinDayThreshold) {
      calculatedMatchCount++;
    }
    currentMonthIteration--;
  }

  return console.log(calculatedMatchCount);
}
