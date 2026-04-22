'use strict';

/**
 * Constants for categorizing applicants to improve code readability and maintainability.
 */
const APPLICANT_CATEGORIES = {
  STANDARD_CANDIDATE: 'a', // Represents a standard applicant type
  SPECIAL_CANDIDATE: 'b',  // Represents a special applicant type
  OTHER_CANDIDATE: 'c'     // Represents any other applicant type, typically not admitted
};

/**
 * Safely parses a string into an integer.
 * This helper function abstracts the parsing logic and handles potential non-numeric inputs
 * by returning NaN, which can be checked if strict validation is needed elsewhere.
 *
 * @param {string} valueString - The string to be converted to an integer.
 * @returns {number} The parsed integer, or NaN if the string is not a valid number.
 */
function convertToInteger(valueString) {
  return Number.parseInt(valueString, 10);
}

/**
 * Orchestrates the admission process for a series of contestants based on specified criteria.
 * This function reads raw input data, parses parameters and applicant types,
 * then determines and logs the admission status for each applicant.
 *
 * @param {string} rawContestInput - A multi-line string containing contest data.
 *   The first line contains numerical parameters (N A B), space-separated.
 *   The second line contains a string of applicant types (e.g., "aabac").
 */
function processContestantAdmissions(rawContestInput) {
  // Defensive check: Ensure input data is not null, undefined, or empty.
  if (!rawContestInput || rawContestInput.trim().length === 0) {
    console.error("Error: Provided contestant input data is empty or invalid.");
    return; // Exit if no valid input is present.
  }

  // Split the raw input string into individual lines, removing any leading/trailing whitespace.
  const inputLines = rawContestInput.trim().split('\n');

  // Guard clause: Verify that at least two lines of data are available (parameters + applicant types).
  if (inputLines.length < 2) {
    console.error("Error: Insufficient input lines. Expected at least two lines for parameters and applicants.");
    return; // Exit if essential data is missing.
  }

  // Parse the first line to extract contest parameters.
  // The first number (N) is often the total count but is not used in the core logic here.
  // We are interested in the A (standard limit) and B (special limit) values.
  const [standardLimitStr, specialLimitStr] = inputLines[0].split(' ').slice(1);

  // Convert the string-based limits to numerical values using the helper function.
  const standardAdmissionLimit = convertToInteger(standardLimitStr);
  const specialAdmissionLimit = convertToInteger(specialLimitStr);

  // Calculate the combined admission threshold for all candidate types.
  const combinedAdmissionThreshold = standardAdmissionLimit + specialAdmissionLimit;

  // Extract applicant types from the second line, treating each character as a distinct applicant.
  const applicantTypeSequence = inputLines[1].split('');

  // An array to store the final admission decisions ("Yes" or "No") for each applicant.
  const finalAdmissionOutcomes = [];

  // Iterate through each applicant in the sequence to determine their admission status.
  // A traditional `for` loop is used to easily manage the current index for ranking
  // and for calculating counts of preceding applicants.
  for (let currentApplicantIndex = 0; currentApplicantIndex < applicantTypeSequence.length; currentApplicantIndex++) {
    const currentApplicantCategory = applicantTypeSequence[currentApplicantIndex];
    // Calculate the 1-based ranking position for the current applicant.
    const currentApplicantRank = currentApplicantIndex + 1;

    let isApplicantAdmitted = false; // Flag to track admission status for the current applicant.

    // Evaluate admission based on the specific category of the current applicant.
    switch (currentApplicantCategory) {
      case APPLICANT_CATEGORIES.STANDARD_CANDIDATE: // Logic for 'a' type applicants
        // Standard applicants are admitted if their rank is strictly less than the combined threshold.
        isApplicantAdmitted = currentApplicantRank < combinedAdmissionThreshold;
        break;

      case APPLICANT_CATEGORIES.SPECIAL_CANDIDATE: // Logic for 'b' type applicants
        // Special applicants have two conditions for admission:
        // 1. Their rank must be strictly less than the combined threshold.
        // 2. Their rank must be strictly less than the count of previous special candidates.
        //    (Note: This second condition, `currentApplicantRank < previousSpecialCandidateCount`,
        //     is unusual as a rank is typically not less than a count of prior items of the same type.
        //     However, this logic precisely replicates the behavior of the original code.)

        // Count how many special (type 'b') applicants appeared *before* the current one.
        const previousSpecialCandidateCount = applicantTypeSequence
          .slice(0, currentApplicantIndex) // Get all applicants from the start up to the one before the current.
          .filter(type => type === APPLICANT_CATEGORIES.SPECIAL_CANDIDATE) // Filter to count only 'b' types.
          .length;

        // Evaluate both conditions for special applicant admission.
        const meetsCombinedThreshold = currentApplicantRank < combinedAdmissionThreshold;
        const meetsPreviousSpecialCountCriteria = currentApplicantRank < previousSpecialCandidateCount;

        isApplicantAdmitted = meetsCombinedThreshold && meetsPreviousSpecialCountCriteria;
        break;

      default: // Any other applicant category (e.g., 'c') is not admitted.
        isApplicantAdmitted = false;
        break;
    }

    // Record the admission decision for the current applicant.
    finalAdmissionOutcomes.push(isApplicantAdmitted ? 'Yes' : 'No');
  }

  // Output all collected admission decisions, each on a new line.
  // Joining the array with '\n' is generally more efficient than calling console.log in a loop.
  console.log(finalAdmissionOutcomes.join('\n'));
}

// Entry point of the script:
// Reads the entire content of the standard input ("/dev/stdin") as a UTF-8 string,
// then passes it to the main processing function.
processContestantAdmissions(require("fs").readFileSync("/dev/stdin", "utf8"));