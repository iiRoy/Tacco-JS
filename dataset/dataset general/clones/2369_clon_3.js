module.exports.reportIssues = (issueList, scanOutcomes) => {
  // This variable serves as a dynamic accumulator for the generated report content.
  let outputCollector = '';
  // Establishes a default term for individual findings, subject to pluralization.
  const findingDescriptor = 'finding';

  // Defines the fixed width for the line and character number display, enabling consistent indentation.
  const PADDING_TARGET_WIDTH = 5;

  /**
   * Generates a string of whitespace to ensure a consistent visual alignment
   * for line and character numbers in the report.
   * @param {number} contentWidth - The calculated width of the text that precedes the padding.
   * @returns {string} A string consisting of spaces, tailored to the required indentation.
   */
  const createAlignmentPadding = (contentWidth) => {
    const requiredSpaces = Math.max(0, PADDING_TARGET_WIDTH - contentWidth);
    return ' '.repeat(requiredSpaces);
  };

  // --- Report Initialization and Header Generation ---

  // Safely attempts to retrieve the source file name from the scan outcomes.
  // Includes robust checks for array validity and object presence.
  const sourceFileIdentifier = (Array.isArray(scanOutcomes) && scanOutcomes.length > 0 && scanOutcomes[0].file)
                               ? scanOutcomes[0].file
                               : 'Unidentified Source';

  outputCollector += `--- Automated Code Review: ${sourceFileIdentifier} ---\n\n`;

  // --- Core Logic: Processing and Displaying Issues ---

  // Verifies that the issue list is a valid array and contains entries.
  if (Array.isArray(issueList) && issueList.length > 0) {
    // Dynamically determines the correct pluralization of the finding descriptor.
    const finalDescriptorTerm = issueList.length > 1 ? `${findingDescriptor}s` : findingDescriptor;

    /**
     * Formats a single issue object into a readable string line for the report.
     * This function encapsulates the logic for individual issue presentation.
     * @param {object} itemEntry - An object containing details about a single issue.
     * @returns {string} The fully formatted string representation of the issue.
     */
    const formatIssueEntry = (itemEntry) => {
      const issueDetails = itemEntry.error; // Assumes 'error' property holds core issue data.
      const lineNumber = issueDetails.line;
      const charPosition = issueDetails.character;
      const issueDescription = issueDetails.reason;

      // Constructs the position string and calculates its length for padding.
      const positionString = `${lineNumber},${charPosition}`;
      const padding = createAlignmentPadding(positionString.length);

      return `${padding} ${positionString}: ${issueDescription}\n`;
    };

    // Iterates through each detected issue and appends its formatted representation.
    for (const currentIssue of issueList) {
      outputCollector += formatIssueEntry(currentIssue);
    }

    // Appends a summary footer to the report, including navigation tips.
    outputCollector += `\nSummary: ${issueList.length} ${finalDescriptorTerm} identified. Please review.\n`;
    outputCollector += '(IDE navigation: F4 for next, Shift+F4 for previous. Close with ESC.)\n';

  } else {
    // Message displayed when no issues are found, indicating a clean scan.
    outputCollector += 'No code findings detected! Your codebase appears clean. (ESC to close)\n';
  }

  // Outputs the entire accumulated report string to the console.
  console.log(outputCollector);
};