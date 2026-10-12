const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = SECONDS_IN_MINUTE * 60;

function DurationFormatter(totalSeconds) {
  const _totalSeconds = totalSeconds;

  this.getHoursComponent = function() {
    return Math.floor(_totalSeconds / SECONDS_IN_HOUR);
  };

  this.getMinutesComponent = function() {
    const secondsAfterHours = _totalSeconds % SECONDS_IN_HOUR;
    return Math.floor(secondsAfterHours / SECONDS_IN_MINUTE);
  };

  this.getSecondsComponent = function() {
    return _totalSeconds % SECONDS_IN_MINUTE;
  };

  this.toFormattedString = function(timeDelimiter) {
    let effectiveDelimiter;
    if (timeDelimiter === undefined || timeDelimiter === null) {
      effectiveDelimiter = ':';
    } else {
      effectiveDelimiter = timeDelimiter;
    }

    const hourPart = this.getHoursComponent();
    const minutePart = this.getMinutesComponent();
    const secondPart = this.getSecondsComponent();

    return [hourPart, minutePart, secondPart].join(effectiveDelimiter);
  };
}

function executeTimeConversion(standardInput) {
  const rawInputLines = standardInput.toString().trim().split('\n');

  const initialSecondsValue = parseInt(rawInputLines[0], 10);

  const durationInstance = new DurationFormatter(initialSecondsValue);

  const finalFormattedTime = durationInstance.toFormattedString();

  console.log(finalFormattedTime);
}

executeTimeConversion(require('fs').readFileSync('/dev/stdin', 'utf8'));
