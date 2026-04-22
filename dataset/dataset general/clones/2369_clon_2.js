exports.issuePresenter = function (problemSet, analysisResults) {
  var
    reportContent = '', // Main string accumulator for the final report.
    alertLabel = 'issue'; // Default label for a single detected issue.

  /**
   * Generates a string composed of spaces for left-padding text.
   * The number of spaces is determined by a fixed value minus the input length.
   *
   * @param {number} textWidth The numerical width of the content to be padded.
   * @returns {string} A string containing the calculated number of spaces.
   */
  function padLeft(textWidth) {
    var
      indentAmount = 5 - textWidth, // Calculates the required number of leading spaces.
      paddingText = '',             // String to build the indentation.
      idx;                          // Loop counter for space generation.

    // Loop to append spaces based on the calculated amount.
    for (idx = 0; idx < indentAmount; idx = idx + 1) {
      paddingText += ' ';
    }

    return paddingText; // Returns the generated padding string.
  }

  // Appends an initial header to the report content, including the analyzed file name.
  reportContent += '(Static Analysis: ' + analysisResults[0].targetFile + ')\n\n';

  // Checks if the array of problems contains any entries.
  if (problemSet.length) {
    // If there is more than one problem, pluralize the alert label.
    if (problemSet.length > 1) {
      alertLabel += 's';
    }

    // Iterates through each problem entry in the set.
    problemSet.forEach(function (entry) {
      var
        specificIssue = entry.violationObject; // Extracts the detailed issue object.

      // Formats and appends the issue details (line, column, description) to the report.
      reportContent += padLeft((specificIssue.rowPosition + specificIssue.charPosition.toString()).length) + ' ' + specificIssue.rowPosition + ',' + specificIssue.charPosition + ':' + ' ' + specificIssue.issueDescription + '\n';
    });

    // Appends a summary line for all detected issues and navigation instructions.
    reportContent += '\n× ' + problemSet.length + ' ' + alertLabel + ', errors encountered. Use F4 for navigation.\n';

  } else {
    // If no problems are found, appends a success message.
    reportContent += '✔ No issues found. Press ESC to dismiss.\n';
  }

  // Outputs the complete generated report string to the console.
  console.log(reportContent);
};