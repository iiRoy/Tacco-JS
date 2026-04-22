'use strict';
const timeUtil = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

timeUtil.on('line', (dataUnit) => {
  const totalDurationInSeconds = +dataUnit;
  
  const currentMinutesTotal = Math.trunc(totalDurationInSeconds / 60);
  const resultSeconds = totalDurationInSeconds % 60;
  
  const resultHours = Math.trunc(currentMinutesTotal / 60);
  const resultMinutes = currentMinutesTotal % 60;
  
  process.stdout.write(`${resultHours}:${resultMinutes}:${resultSeconds}\n`);
});