'use strict';

(function(inputDataBuffer) {
    // Convert the input buffer to a string, trim whitespace, and split into lines
    var inputLines = inputDataBuffer.toString().trim().split('\n');

    /**
     * Calculates hours, minutes, and seconds from a total number of seconds.
     * @param {number} totalSecondsValue - The total number of seconds.
     * @returns {Array<number>} An array containing [hours, minutes, seconds].
     */
    function convertSecondsToHMS(totalSecondsValue) {
        // Calculate total minutes first
        var totalMinutesCalculated = Math.floor(totalSecondsValue / 60);

        // Determine the seconds component (remainder after dividing by 60)
        var secondsComponent = totalSecondsValue % 60;

        // Calculate the hours component from the total minutes
        var hoursComponent = Math.floor(totalMinutesCalculated / 60);

        // Determine the minutes component (remainder after dividing total minutes by 60)
        var minutesComponent = totalMinutesCalculated % 60;

        // Return the components in the expected order
        return [hoursComponent, minutesComponent, secondsComponent];
    }

    // Parse the first line of input as an integer, base 10
    var initialSecondsInput = parseInt(inputLines[0], 10);

    // Call the conversion function with the parsed input
    var timeComponentsArray = convertSecondsToHMS(initialSecondsInput);

    // Output the calculated hours, minutes, and seconds, separated by spaces
    console.log(timeComponentsArray[0], timeComponentsArray[1], timeComponentsArray[2]);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
