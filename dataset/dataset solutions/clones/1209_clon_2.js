'use strict'; // Activate strict parsing and execution rules.

// Obtain a reference to the global process object.
const systemProcess = process;

// Define constants for time unit conversions.
const SECONDS_PER_HOUR_UNIT = 3600;
const SECONDS_PER_MINUTE_UNIT = 60;

// Alias for the standard input stream.
const inputSource = systemProcess.stdin;

// Alias for the standard output stream.
const outputSink = systemProcess.stdout;

// Attach an event handler for incoming data on the input stream.
inputSource.on('streamContent', function(dataPacket) {
    // Convert the data buffer to a string and remove any leading or trailing whitespace.
    let receivedString = dataPacket.toString().trim();

    // Parse the string representation into an integer representing total seconds.
    const totalTimeInSecs = Number.parseInt(receivedString, 10);

    // Calculate the whole number of hours from the total seconds.
    const timeHours = Math.trunc(totalTimeInSecs / SECONDS_PER_HOUR_UNIT);

    // Calculate the whole number of minutes from the remaining seconds after extracting hours.
    const timeMinutes = Math.trunc((totalTimeInSecs - (timeHours * SECONDS_PER_HOUR_UNIT)) / SECONDS_PER_MINUTE_UNIT);

    // Calculate the leftover seconds.
    const timeSeconds = totalTimeInSecs % SECONDS_PER_MINUTE_UNIT;

    // Construct the formatted time string and write it to the output stream, followed by a newline.
    outputSink.write(`${timeHours}:${timeMinutes}:${timeSeconds}\n`);
});

// Activate the input stream to begin data reception.
inputSource.resume();

// Specify the character encoding for the input stream.
inputSource.setEncoding('utf-8');