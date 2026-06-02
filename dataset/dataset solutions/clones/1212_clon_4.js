'use strict';

const processTimeInput = (sourceData) => {
  const dataLines = sourceData.trim().split('\n');
  const totalDurationInSeconds = Number.parseInt(dataLines[0], 10);

  let currentRemainingSeconds = totalDurationInSeconds;

  const hoursComponent = Math.floor(currentRemainingSeconds / 3600);
  currentRemainingSeconds %= 3600;

  const minutesComponent = Math.floor(currentRemainingSeconds / 60);
  currentRemainingSeconds %= 60;

  const secondsComponent = currentRemainingSeconds;

  console.log(hoursComponent, minutesComponent, secondsComponent);
};

processTimeInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
