(function(inputSource) {
  function renderTimeComponents(totalSecondsValue, separationCharacter) {
    const activeSeparator = separationCharacter || ':';

    const overallMinutes = Math.floor(totalSecondsValue / 60);
    const secondsPart = totalSecondsValue % 60;

    const hoursPart = Math.floor(overallMinutes / 60);
    const minutesPart = overallMinutes % 60;

    return hoursPart + activeSeparator + minutesPart + activeSeparator + secondsPart;
  }

  const sourceDataLines = inputSource.toString().trim().split('\n');

  const finalOutputString = (function(initialSecondsValue) {
    return renderTimeComponents(initialSecondsValue);
  }(parseInt(sourceDataLines[0], 10)));

  console.log(finalOutputString);

}(require('fs').readFileSync('/dev/stdin', 'utf8')));
