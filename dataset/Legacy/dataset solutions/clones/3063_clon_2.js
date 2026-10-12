"use strict";

const processInput = (inputData) => {
  // Split the incoming string by newline characters
  inputData = inputData.split("\n");

  // Extract the maximum allowed distance from the end of the array
  const maxDistance = parseInt(inputData.pop());

  // Convert remaining string elements to integers, representing sensor readings
  const sensorReadings = inputData.map((item) => parseInt(item));

  // Check if the difference between the 5th and 1st sensor reading exceeds the max allowed distance
  // Output a sad face if it does, otherwise a happy message.
  console.log(
    sensorReadings[4] - sensorReadings[0] > maxDistance ? ":(" : "Yay!"
  );

  /*
   * The commented-out section below represents an alternative, more general
   * approach to checking all pairs of sensor readings.
   * However, the active logic only checks a specific pair (index 4 and 0).
   *
   * for (let firstIdx = 0; firstIdx < sensorReadings.length; firstIdx++) {
   *   for (let secondIdx = firstIdx + 1; secondIdx < sensorReadings.length; secondIdx++) {
   *     if (sensorReadings[secondIdx] - sensorReadings[firstIdx] > maxDistance) {
   *       console.log(":(");
   *       return;
   *     }
   *   }
   * }
   *
   * console.log("Yay!");
   */
};

// Read input from standard input and pass it to the processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
