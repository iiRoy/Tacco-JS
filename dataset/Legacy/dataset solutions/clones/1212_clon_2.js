'use strict';

(function(inputSource) {
  // Read all input data, convert to string, remove leading/trailing whitespace, and split into lines.
  let dataLines = inputSource.toString().trim().split('\n');

  (function(totalSeconds) {
    // Calculate the number of hours from the total seconds.
    let hoursVal = parseInt(totalSeconds / 3600);
    // Calculate the number of minutes from the remaining seconds after hours are accounted for.
    let minutesVal = parseInt((totalSeconds / 60) % 60);
    // Calculate the remaining seconds after hours and minutes are accounted for.
    let secondsVal = totalSeconds % 60;

    // Output the calculated hours, minutes, and seconds to the console.
    console.log(hoursVal, minutesVal, secondsVal);

  })(parseInt(dataLines[0], 10)); // Parse the first line of input as an integer (base 10).

}(require('fs').readFileSync('/dev/stdin', 'utf8'))); // Read the entire content of /dev/stdin as a UTF-8 string.
