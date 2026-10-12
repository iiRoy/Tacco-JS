'use strict';

const SECONDS_IN_HOUR_CONSTANT = 3600;
const SECONDS_IN_MINUTE_CONSTANT = 60;

process.stdin.on('data', function(inputBuffer) {
  const rawInputString = inputBuffer.toString().trim();
  const totalDurationInSeconds = Number(rawInputString);

  const calculatedHours = Math.floor(totalDurationInSeconds / SECONDS_IN_HOUR_CONSTANT);
  
  const remainingSecondsAfterHours = totalDurationInSeconds % SECONDS_IN_HOUR_CONSTANT;
  
  const calculatedMinutes = Math.floor(remainingSecondsAfterHours / SECONDS_IN_MINUTE_CONSTANT);
  
  const finalSecondsComponent = totalDurationInSeconds % SECONDS_IN_MINUTE_CONSTANT;

  const timeParts = [calculatedHours, calculatedMinutes, finalSecondsComponent];
  console.log(timeParts.join(':'));
});

process.stdin.resume();
process.stdin.setEncoding('utf8');
