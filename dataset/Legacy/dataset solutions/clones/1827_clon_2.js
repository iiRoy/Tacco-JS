"use strict";

// This function processes the provided input string to calculate a time difference.
const processInput = (inputData) => {

    // Split the input string into individual lines.
    let inputRows = inputData.split('\n');

    // Extract the first line, split it by spaces, and convert each part to a number.
    let initialValues = inputRows.shift().split(' ').map(function(numStr) {
        return +numStr;
    });

    // Calculate the total minutes for the first time point.
    let hourOneMinutes = initialValues[0] * 60;
    let startTimeInMinutes = hourOneMinutes + initialValues[1];

    // Calculate the total minutes for the second time point.
    let hourTwoMinutes = initialValues[2] * 60;
    let endTimeInMinutes = hourTwoMinutes + initialValues[3];

    // Get the deduction value.
    let deductionValue = initialValues[4];

    // Determine the time difference based on whether the second time is later on the same "day" or the next.
    if (startTimeInMinutes < endTimeInMinutes) {
        // If the end time is later on the same "day", calculate direct difference.
        console.log(endTimeInMinutes - startTimeInMinutes - deductionValue);
    } else {
        // If the end time is on the "next day" (or cycle wraps around), calculate remaining time in current cycle
        // and add the time from the start of the next cycle.
        let remainingMinutesToday = 3600 - startTimeInMinutes; // Note: 3600 is a specific constant from the original logic.
        console.log(endTimeInMinutes + remainingMinutesToday - deductionValue);
    }

};

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
