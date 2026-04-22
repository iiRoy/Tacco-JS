"use strict";

// Entry point for the application, processing standard input.
executeProgram(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .replace(/\r?\n$/, "")
    .split(/\r?\n/)
);

function executeProgram(inputData) {
  // Extract and parse the first numeric array from the input lines.
  var firstVector = inputData[1]
    .split(" ")
    .map(Number);

  // Extract and parse the second numeric array from the input lines.
  var secondVector = inputData[2]
    .split(" ")
    .map(Number);

  /**
   * Computes the generalized Minkowski distance between two vectors.
   * @param {Array<Number>} vecA          - The initial vector.
   * @param {Array<Number>} vecB          - The target vector.
   * @param {Number}        powerExponent - The exponent 'p' defining the distance type.
   * @returns {Number} The computed distance value.
   */
  function calculateMetric(vecA, vecB, powerExponent) {
    var totalAccumulation = vecA
      .map(function (elementA, indexPos) {
        return Math.pow(Math.abs(elementA - vecB[indexPos]), powerExponent);
      })
      .reduce(function (accumulatorVal, currentVal) {
        return accumulatorVal + currentVal;
      });

    return Math.pow(totalAccumulation, 1 / powerExponent);
  }

  // Display the Manhattan distance (p=1).
  console.log(calculateMetric(firstVector, secondVector, 1));

  // Display the Euclidean distance (p=2).
  console.log(calculateMetric(firstVector, secondVector, 2));

  // Display the Minkowski distance for p=3.
  console.log(calculateMetric(firstVector, secondVector, 3));

  // Display the Chebyshev distance (L-infinity norm).
  console.log(
    Math.max.apply(
      0,
      firstVector.map(function (componentA, componentIndex) {
        return Math.abs(componentA - secondVector[componentIndex]);
      })
    )
  );
}