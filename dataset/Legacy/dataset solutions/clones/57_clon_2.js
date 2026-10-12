(function () {
  // This variable will accumulate all data received from standard input.
  var rawData = '';

  /**
   * The main entry point for processing the input and performing the calculation.
   * It parses the input value, then calls a helper function to compute the integral approximation.
   */
  function processInputAndCalculate() {
    var deltaVal, // Represents the 'd' value, typically a step size for numerical methods.
        limitVal = 600; // A constant upper bound used in the integral approximation.

    // The first line of input is expected to be a floating-point number.
    deltaVal = parseFloat(rawData[0]);

    // Compute the approximate area and display the rounded result to the console.
    console.log(computeApproximateArea(deltaVal, limitVal));
  }

  /**
   * Computes an approximation of a definite integral using a Riemann sum.
   * Specifically, it approximates the integral of x^2 from 0 up to a certain limit.
   *
   * @param {number} stepSize - The width of each sub-interval (delta x).
   * @param {number} upperBound - A reference value for the integration limit (not directly the upper bound of integration).
   * @returns {number} The total approximate area, rounded to the nearest whole number.
   */
  function computeApproximateArea(stepSize, upperBound) {
    var iterationIndex, // Loop counter, representing 'i' in the original formula.
        accumulatedSum = 0; // Variable to store the running total of rectangle areas.

    // Iterate to sum the areas of rectangles. The loop continues as long as
    // the current x-coordinate (iterationIndex * stepSize) is less than 600.
    for (iterationIndex = 1; iterationIndex * stepSize < 600; iterationIndex += 1) {
      // Calculate the area of the current rectangle: (height * width).
      // Height is (current x-coordinate)^2, and width is 'stepSize'.
      accumulatedSum += Math.pow(iterationIndex * stepSize, 2) * stepSize;
    }

    // Return the final sum, rounded to the nearest integer.
    return Math.round(accumulatedSum);
  }


  // Prepare standard input stream to receive data.
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  // Attach an event listener to handle incoming data chunks.
  // Each chunk is appended to the 'rawData' string.
  process.stdin.on('data', function (dataSegment) {
    rawData += dataSegment;
  });

  // Attach an event listener for when the entire input stream has ended.
  // The accumulated 'rawData' is split into lines, and then the main processing function is called.
  process.stdin.on('end', function () {
    rawData = rawData.split('\n');
    processInputAndCalculate();
  });
}());
