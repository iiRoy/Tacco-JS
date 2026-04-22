// This function processes a set of 2D coordinates to calculate a specific relationship score for each point.
// It takes raw string input, parses it, determines direct relationships between points,
// and then aggregates these relationships to produce a final score for each coordinate pair.
function ProcessCoordinateData(rawInputLines) {
  // --- Input Pre-processing and Validation ---
  if (typeof rawInputLines !== 'string' || rawInputLines.trim() === '') {
    // Adding a guard clause for invalid input type or empty string
    console.error("Error: Input must be a non-empty string.");
    return;
  }

  // Split input into individual lines and filter out any completely empty ones.
  const dataLines = rawInputLines.split('\n').filter(line => line.trim() !== '');
  
  if (dataLines.length === 0) {
    console.error("Error: No meaningful data lines found after splitting.");
    return;
  }

  // Attempt to parse the total number of points from the very first line of the input.
  let totalPoints = Number(dataLines[0].trim()); // Using Number() for parsing, and trim for robustness

  if (isNaN(totalPoints) || totalPoints < 0) {
    // Validation for the number of points (Type III Addition)
    console.error(`Error: Invalid or negative number of points specified: "${dataLines[0]}".`);
    return;
  }

  // Array to store parsed coordinate objects.
  // Changed from separate x/y arrays to an array of objects for better data encapsulation.
  const parsedPointsCollection = []; 

  // Loop through subsequent lines to parse individual coordinate pairs.
  for (let currentLineIndex = 1; currentLineIndex <= totalPoints; currentLineIndex++) {
    if (currentLineIndex >= dataLines.length) {
      // Guard against insufficient data lines, indicating input might be truncated.
      console.warn(`Warning: Expected ${totalPoints} points, but only found ${parsedPointsCollection.length}. Stopping parsing early.`);
      totalPoints = parsedPointsCollection.length; // Adjust totalPoints if data is short
      break;
    }

    // Split the current line by any whitespace and filter out empty strings resulting from multiple spaces.
    const coordinateStrings = dataLines[currentLineIndex].split(/\s+/).filter(s => s !== '');
    
    if (coordinateStrings.length !== 2) {
      // Validation for coordinate format: ensure exactly two numbers are present.
      console.warn(`Warning: Skipping malformed coordinate line (expected 2 numbers): "${dataLines[currentLineIndex]}".`);
      continue; // Skip to the next line if format is incorrect
    }

    const xVal = Number(coordinateStrings[0]);
    const yVal = Number(coordinateStrings[1]);

    if (isNaN(xVal) || isNaN(yVal)) {
      // Validation for numeric values: ensure parsed values are actual numbers.
      console.warn(`Warning: Skipping line with non-numeric coordinates: "${dataLines[currentLineIndex]}".`);
      continue; // Skip if values are not numbers
    }

    // Add the successfully parsed point as an object to our collection.
    parsedPointsCollection.push({ x: xVal, y: yVal });
  }

  // Adjust totalPoints if some lines were skipped during parsing due to validation errors.
  if (parsedPointsCollection.length < totalPoints) {
    console.warn(`Adjusting totalPoints from ${totalPoints} to actual parsed count: ${parsedPointsCollection.length}`);
    totalPoints = parsedPointsCollection.length;
  }
  
  // If no points were successfully parsed after all validation, exit.
  if (totalPoints === 0) {
      console.error("Error: No valid coordinate points were parsed.");
      return;
  }

  // --- Helper Function for Relationship Check (Type III Abstraction) ---
  // This utility function determines if two points are "directionally aligned".
  // This means either both their X and Y coordinates are greater, or both are less,
  // compared to each other. It effectively checks for dominance or being dominated.
  const areCoordinatesDirectionallyAligned = (ptA, ptB) => {
    // Explicitly check for identical point references; though loop logic prevents same index,
    // this adds robustness if used in other contexts.
    if (ptA === ptB) return false;

    // Condition for ptA dominating ptB (both x and y are greater)
    const ptADominatesPtB = (ptA.x > ptB.x && ptA.y > ptB.y);
    // Condition for ptA being dominated by ptB (both x and y are lesser)
    const ptBDominatesPtA = (ptA.x < ptB.x && ptA.y < ptB.y);
    
    return ptADominatesPtB || ptBDominatesPtA;
  };

  // --- First Pass: Calculate Direct Relationship Metrics ---
  // This array stores, for each point 'j', how many other points 'k' are directly related to 'j'
  // based on the `areCoordinatesDirectionallyAligned` criterion.
  const directRelationshipMetrics = Array(totalPoints).fill(0); // Pre-allocate and initialize all counts to zero.

  for (let primaryPointIndex = 0; primaryPointIndex < totalPoints; primaryPointIndex++) {
    for (let secondaryPointIndex = 0; secondaryPointIndex < totalPoints; secondaryPointIndex++) {
      // Ensure we are not comparing a point to itself.
      if (primaryPointIndex !== secondaryPointIndex) {
        const pointA = parsedPointsCollection[primaryPointIndex];
        const pointB = parsedPointsCollection[secondaryPointIndex];

        // If the two points are directionally aligned, increment the metric for the primary point.
        if (areCoordinatesDirectionallyAligned(pointA, pointB)) {
          directRelationshipMetrics[primaryPointIndex]++;
        }
      }
    }
  }

  // --- Second Pass: Calculate Aggregate Relationship Scores ---
  // This section determines the final score for each point. The score is 1 (for the point itself)
  // plus the sum of `directRelationshipMetrics` of all other points that are directionally aligned
  // with the current point.
  for (let currentPointProcessingIndex = 0; currentPointProcessingIndex < totalPoints; currentPointProcessingIndex++) {
    // Initialize the score for the current point. It starts at 1 to include itself in the "ranking"
    // or aggregate count, as per the problem's implicit requirement.
    let finalAggregateScore = 1; 

    // Retrieve the point currently being evaluated for its aggregate score.
    const evaluatingPoint = parsedPointsCollection[currentPointProcessingIndex];

    for (let comparedPointIndex = 0; comparedPointIndex < totalPoints; comparedPointIndex++) {
      // Skip self-comparison as a point cannot be related to itself in this context.
      if (currentPointProcessingIndex !== comparedPointIndex) {
        const comparedPoint = parsedPointsCollection[comparedPointIndex];

        // Check if the current point and the compared point are directionally aligned.
        if (areCoordinatesDirectionallyAligned(evaluatingPoint, comparedPoint)) {
          // If they are aligned, add the direct relationship metric of the *compared* point
          // to the current point's aggregate score. This creates a transitive-like summation.
          finalAggregateScore += directRelationshipMetrics[comparedPointIndex];
        }
      }
    }
    // Output the final calculated aggregate score for the current point.
    console.log(finalAggregateScore);
  }
}

// --- Execution Context ---
// This block handles reading input from standard input and invoking the main processing function.
// It's wrapped in a try-catch block for more robust error handling during file operations.
try {
  // Using Node.js 'fs' module to synchronously read the entire content of standard input.
  // This is a common pattern in competitive programming environments.
  const fileSystemModule = require("fs");
  const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

  // Call the main function to process the input data.
  ProcessCoordinateData(standardInputContent);
} catch (errorReadingInput) {
  // Catch potential errors that might occur during file reading.
  console.error("Failed to read input from /dev/stdin:", errorReadingInput.message);
  // Exit the process with an error code to indicate failure.
  process.exit(1); 
}