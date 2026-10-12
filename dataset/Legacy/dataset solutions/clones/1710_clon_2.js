'use strict';

// This function processes the raw input string to determine optimal course selections.
function processData(rawInputString) {
  // Divide the entire input into an array of individual lines.
  const inputLines = rawInputString.split('\n');

  // Extract the number of days from the first line.
  const numDays = parseInt(inputLines[0], 10);

  // Parse the second line, which contains space-separated cost strings.
  let costStringArray = inputLines[1].split(' ');
  // Convert these cost strings into an array of integer values.
  const dailyCostValues = costStringArray.map(strValue => parseInt(strValue, 10));

  // Initialize a two-dimensional array to store satisfaction scores for each day and course.
  let satisfactionScores = [];

  // Iterate through the remaining input lines to populate the satisfaction scores matrix.
  // The actual data starts from the third line (index 2).
  for (let lineIndex = 2; lineIndex < inputLines.length; lineIndex++) {
    // Add a new sub-array for the current day's scores.
    satisfactionScores.push([]);

    // Split the current line into individual score parts.
    const currentLineParts = inputLines[lineIndex].split(' ');

    // Convert each score part to an integer and add it to the current day's scores.
    for (let partIndex = 0; partIndex < currentLineParts.length; partIndex++) {
      satisfactionScores[lineIndex - 2].push(parseInt(currentLineParts[partIndex], 10));
    }
  }

  // Initialize an array to store the 1-based index of the best course chosen for each day.
  let selectedCourses = [];

  // Iterate through each day's available courses to find the one with maximum satisfaction.
  for (let dayIteration = 0; dayIteration < satisfactionScores.length; dayIteration++) {
    // Assume the first course of the current day has the highest satisfaction initially.
    let currentMaxScore = satisfactionScores[dayIteration][0];
    let bestCourseOption = 0; // Store the 0-based index of this best course.

    // Compare with all other courses for the current day.
    for (let courseOptionIndex = 1; courseOptionIndex < satisfactionScores[dayIteration].length; courseOptionIndex++) {
      // If a course with higher satisfaction is found, update the maximum and its index.
      if (satisfactionScores[dayIteration][courseOptionIndex] > currentMaxScore) {
        bestCourseOption = courseOptionIndex;
        currentMaxScore = satisfactionScores[dayIteration][courseOptionIndex];
      }
    }
    // Add the 1-based index of the best course for the current day to the results.
    selectedCourses.push(bestCourseOption + 1);
  }

  // Output the final array of selected course indices.
  console.log(selectedCourses);
}

// Read the input from standard input and pass it to the processing function.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));

// This line is present in the original code. It would cause a ReferenceError
// because 'input' (or 'rawInputString' in this clone) is not defined in the global scope.
// To maintain strict behavioral equivalence, this line is included as-is,
// ensuring the clone also produces a ReferenceError at this point.
processData(rawInputString);
