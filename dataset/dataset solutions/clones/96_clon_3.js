(function(sourceDataContent) {
  // Guard clause: Ensure input data is a non-empty string.
  if (typeof sourceDataContent !== 'string' || sourceDataContent.length === 0) {
    console.error("Error: Input data is either not a string or empty. Cannot process.");
    return;
  }

  // Prepare input: Trim leading/trailing whitespace including newlines, then split into individual lines.
  const processedInputLines = sourceDataContent.trim().split('\n');

  // Extract and validate the total number of test cases from the first line.
  const numberOfCasesLine = processedInputLines.shift();
  if (!numberOfCasesLine) {
    console.error("Error: The first line, indicating the number of test cases, is missing.");
    return;
  }

  const totalProblemCases = Number(numberOfCasesLine);

  // Validate that the number of test cases is a non-negative integer.
  if (isNaN(totalProblemCases) || !Number.isInteger(totalProblemCases) || totalProblemCases < 0) {
    console.error(`Error: Invalid number of test cases provided: '${numberOfCasesLine}'. Expected a non-negative integer.`);
    return;
  }

  // Initialize an array to store the outcomes of each test case.
  const finalResults = [];

  /**
   * Helper function to parse a single line of circle parameters into a structured object.
   * Performs basic validation on the parameter count and value types.
   * @param {string} line - The input line containing space-separated numeric values for two circles.
   * @returns {object} An object containing the coordinates (c1x, c1y, c2x, c2y) and radii (r1, r2).
   * @throws {Error} If the line format is incorrect or contains invalid numeric values (e.g., negative radii).
   */
  const extractCircleGeometry = (line) => {
    const rawValues = line.split(' ').map(val => parseFloat(val.trim()));

    // Validate that exactly 6 numeric parameters were parsed successfully.
    if (rawValues.length !== 6 || rawValues.some(isNaN)) {
      throw new Error(`Parameter line format error. Expected 6 valid numbers, but received: '${line}'`);
    }

    const [
      circleOneX, circleOneY, radiusOne,
      circleTwoX, circleTwoY, radiusTwo
    ] = rawValues;

    // Validate that radii are non-negative, as per typical geometric constraints.
    if (radiusOne < 0 || radiusTwo < 0) {
        throw new Error(`Negative radius detected. Radii must be non-negative. Line: '${line}'`);
    }

    return {
      c1x: circleOneX,
      c1y: circleOneY,
      r1: radiusOne,
      c2x: circleTwoX,
      c2y: circleTwoY,
      r2: radiusTwo
    };
  };

  /**
   * Determines the geometric relationship between two circles based on their center distance and radii.
   * The classification follows specific rules:
   * 2: Circle A contains Circle B, or they touch internally.
   * -2: Circle B contains Circle A, or they touch internally.
   * 1: Circles intersect at two points, or touch externally.
   * 0: Circles are entirely separate and do not touch.
   * @param {number} centerDistance - The Euclidean distance between the centers of the two circles.
   * @param {number} rA - Radius of the first circle.
   * @param {number} rB - Radius of the second circle.
   * @returns {number} An integer representing the determined relationship.
   */
  const categorizeCircleRelationship = (centerDistance, rA, rB) => {
    // Condition 1: Circle A contains Circle B (or they touch internally).
    // This happens if radius A is greater than or equal to the distance plus radius B.
    if (rA >= centerDistance + rB) {
      return 2;
    }
    // Condition 2: Circle B contains Circle A (or they touch internally).
    // This happens if radius B is greater than or equal to the distance plus radius A.
    else if (rB >= centerDistance + rA) {
      return -2;
    }
    // Condition 3: Circles intersect or touch externally.
    // This occurs if the distance between centers is less than or equal to the sum of their radii.
    else if (centerDistance <= rA + rB) {
      return 1;
    }
    // Condition 4: Circles are entirely separate and do not touch.
    // This is the default case if none of the above conditions are met.
    else {
      return 0;
    }
  };

  // Iterate through each test case as specified by totalProblemCases.
  for (let caseIterator = 0; caseIterator < totalProblemCases; caseIterator++) {
    const currentTestCaseLine = processedInputLines.shift();

    // Guard against insufficient data lines, which might happen if input is malformed.
    if (!currentTestCaseLine) {
      console.warn(`Warning: Insufficient input lines for test case ${caseIterator + 1}. Expected ${totalProblemCases} cases.`);
      finalResults.push("MISSING_DATA_ERROR"); // Log an error indicator for this case.
      continue;
    }

    let circleGeometryData;
    try {
      circleGeometryData = extractCircleGeometry(currentTestCaseLine);
    } catch (parseError) {
      console.error(`Error processing line for case ${caseIterator + 1}: ${parseError.message}`);
      finalResults.push("PARSE_ERROR"); // Log an error indicator for this case.
      continue;
    }

    const { c1x, c1y, r1, c2x, c2y, r2 } = circleGeometryData;

    // Calculate the Euclidean distance between the centers of the two circles.
    // Using Math.hypot for improved precision and conciseness compared to Math.sqrt(Math.pow(...,2) + Math.pow(...,2)).
    const distanceBetweenCircleCenters = Math.hypot(c2x - c1x, c2y - c1y);

    // Determine the relationship using the dedicated helper function.
    const currentCaseResult = categorizeCircleRelationship(
      distanceBetweenCircleCenters,
      r1,
      r2
    );

    finalResults.push(currentCaseResult);
  }

  // After processing all test cases, print each collected result.
  finalResults.forEach(outputValue => console.log(outputValue));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));