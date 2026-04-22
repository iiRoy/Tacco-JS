'use strict';
// This module processes student assessment data to assign letter grades.
// The input is expected to be a multi-line string where each line
// represents a student's scores.

(function(inputSource) {
  // Helper function to convert a string line into an array of numbers.
  // Includes basic validation for numeric conversion.
  const parseScoreLine = (lineText) => {
    // If the line is empty or just whitespace, return an empty array.
    if (!lineText || lineText.trim() === '') {
      return [];
    }
    const numericalComponents = lineText.split(' ').map(segment => {
      const num = Number(segment);
      // Ensure that parsed components are actual numbers.
      if (Number.isNaN(num)) {
        console.warn(`Warning: Non-numeric segment encountered and converted to 0: "${segment}"`);
        return 0; // Default to 0 for non-numeric segments.
      }
      return num;
    });
    return numericalComponents;
  };

  // Function to evaluate a student's performance based on multiple criteria.
  // This is the core grading logic.
  const evaluatePerformance = (assessmentComponents) => {
    // Basic validation: ensure assessmentComponents is an array and has expected length.
    if (!Array.isArray(assessmentComponents) || assessmentComponents.length < 3) {
      console.error('Invalid assessment data provided. Expected an array with at least 3 components.');
      return 'INVALID_INPUT'; // Return a distinct error grade.
    }

    const firstScore = assessmentComponents[0];
    const secondScore = assessmentComponents[1];
    const thirdScore = assessmentComponents[2];

    // Special condition check for specific sentinel values indicating an early exit.
    // This is a direct check rather than using indexOf on a temporary array.
    if (firstScore === -1 || secondScore === -1) {
      return 'F'; // Immediate failure.
    }

    // Calculate the cumulative sum of the primary assessment components.
    const cumulativePoints = firstScore + secondScore;

    // Define the grading thresholds and their corresponding outcomes.
    // Storing them as an array of objects for better pairing and readability.
    const gradingTiers = [
      { minimumPoints: 80, label: 'A' },
      { minimumPoints: 65, label: 'B' },
      { minimumPoints: 50, label: 'C' },
      { minimumPoints: 30, label: evaluateSupplementaryScore(thirdScore) }, // Dynamic label based on third component
      { minimumPoints: 0, label: 'F' }
    ];

    // Iterate through the defined tiers to find the appropriate grade.
    // The loop finds the first tier whose minimum points are met or exceeded.
    for (const currentTier of gradingTiers) {
      if (cumulativePoints >= currentTier.minimumPoints) {
        return currentTier.label; // Return the grade label for the matching tier.
      }
    }

    // Fallback if no grade is matched (should not happen with minimumPoints: 0).
    return 'UNKNOWN';
  };

  // Function to determine a sub-grade based on a supplementary score.
  // This helps in fine-tuning the overall grade for a specific tier.
  const evaluateSupplementaryScore = (bonusValue) => {
    // Input validation for the supplementary score.
    if (typeof bonusValue !== 'number' || Number.isNaN(bonusValue)) {
      console.warn('Warning: Supplementary score is not a valid number. Defaulting to 0 for evaluation.');
      bonusValue = 0; // Treat invalid scores as 0 for this logic.
    }
    // Ternary operator for a concise conditional check.
    return bonusValue >= 50 ? 'C' : 'D';
  };

  // --- Main Processing Logic ---

  // Convert the raw input buffer to a string, clean it, and split into individual lines.
  const rawInputLines = inputSource.toString().trim().split('\n');

  // Check if there's any actual input data.
  if (rawInputLines.length === 0 || (rawInputLines.length === 1 && rawInputLines[0].trim() === '')) {
    console.log('No input data provided for assessment.');
    return; // Exit if no meaningful input.
  }

  // Find the termination marker. All lines before this marker are considered valid data.
  // If the marker is not found, process all lines.
  let terminationIndex = rawInputLines.indexOf('-1 -1 -1');
  if (terminationIndex === -1) {
    terminationIndex = rawInputLines.length; // Process all lines if marker is absent.
  }

  // Extract relevant input lines and transform them into arrays of numbers.
  const studentAssessmentRecords = rawInputLines
    .slice(0, terminationIndex) // Get only the lines before the marker.
    .filter(line => line.trim() !== '') // Filter out any empty lines that might remain.
    .map(parseScoreLine); // Use the helper function to parse each line.

  // If after parsing and filtering, no valid records remain.
  if (studentAssessmentRecords.length === 0) {
    console.log('No valid student assessment records found after processing.');
    return;
  }

  // Apply the grading function to each student's record and collect the results.
  const finalGrades = studentAssessmentRecords.map(evaluatePerformance);

  // Output the final grades, each on a new line.
  console.log(finalGrades.join('\n'));

// The IIFE is immediately invoked with the content read from standard input.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));