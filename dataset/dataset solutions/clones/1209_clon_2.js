"use strict"; // Enforce strict parsing and error handling for the entire script.

// Attach an event listener to the standard input stream for 'data' events.
process.stdin.on('data', function (dataBlock) {
  // Convert the incoming data chunk to a string and remove any leading or trailing whitespace.
  const rawInputString = dataBlock.toString().trim();

  // Convert the processed input string into a numerical value, representing the total duration in seconds.
  const totalSeconds = Number(rawInputString);

  // Calculate the number of full hours from the total seconds.
  const hoursComponent = Math.floor(totalSeconds / 3600);

  // Calculate the number of full minutes remaining after accounting for the hours.
  const minutesComponent = Math.floor((totalSeconds - (hoursComponent * 3600)) / 60);

  // Calculate the number of remaining seconds after accounting for hours and minutes.
  const secondsComponent = totalSeconds % 60;

  // Log the calculated time components to the console, formatted as HH:MM:SS.
  console.log([hoursComponent, minutesComponent, secondsComponent].join(':'));
});

// Resume the standard input stream to ensure it starts emitting 'data' events.
process.stdin.resume();

// Set the character encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');
