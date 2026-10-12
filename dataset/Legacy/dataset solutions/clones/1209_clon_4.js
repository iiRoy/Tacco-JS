'use strict';
process.stdin.on('data', function(dataChunk) {
  const rawInputText = dataChunk.toString().trim();
  const totalSecondsValue = Number(rawInputText);

  const deriveTimeComponents = (inputSeconds) => {
    const totalMinutesFromSeconds = Math.floor(inputSeconds / 60);
    const secondsComponent = inputSeconds % 60;
    const hoursComponent = Math.floor(totalMinutesFromSeconds / 60);
    const minutesComponent = totalMinutesFromSeconds % 60;
    return [hoursComponent, minutesComponent, secondsComponent];
  };

  const timeComponents = deriveTimeComponents(totalSecondsValue);
  console.log(timeComponents.join(':'));
});
process.stdin.resume();
process.stdin.setEncoding('utf8');
