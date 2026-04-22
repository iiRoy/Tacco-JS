function ProcessAssertions(rawData) {
  // Validate the incoming data to ensure it's not empty or malformed.
  if (!rawData || typeof rawData !== 'string' || rawData.trim().length === 0) {
    console.error("Error: Input data is either missing, not a string, or empty.");
    return; // Exit or throw an appropriate error.
  }

  // Utility function to safely convert a string to an integer.
  const convertToNumber = (textValue) => {
    const numericValue = parseInt(textValue, 10);
    if (isNaN(numericValue)) {
      throw new Error(`Failed to parse number from string: '${textValue}'`);
    }
    return numericValue;
  };

  let allInputLines = rawData.split("\n");

  // The very first line specifies the total count of individuals.
  const totalParticipants = convertToNumber(allInputLines[0]);

  // Handle the trivial case where there are no participants.
  if (totalParticipants === 0) {
    console.log(0);
    return;
  }

  // Remaining lines contain the statements made by each participant.
  let statementDescriptionSegments = allInputLines.slice(1);

  // This array will store all reported claims, indexed by participant (0-based).
  // Each element is an array of [target_participant_id, claimed_status (1 for honest, 0 for liar)].
  let participantClaims = [];
  let currentSegmentPointer = 0; // Tracks our position in statementDescriptionSegments.

  // Parse the input to populate the participantClaims structure.
  for (let participantIdx = 0; participantIdx < totalParticipants; participantIdx++) {
    // The number on the current line indicates how many statements this participant makes.
    const numberOfStatements = convertToNumber(statementDescriptionSegments[currentSegmentPointer]);
    currentSegmentPointer++; // Advance past this count line.

    // Basic validation for statement count.
    if (numberOfStatements < 0) {
      throw new Error(`Invalid (negative) number of statements encountered for participant ${participantIdx + 1}.`);
    }

    let currentParticipantStatementList = [];
    // Collect all specific claims made by the current participant.
    for (let statementCount = 0; statementCount < numberOfStatements; statementCount++) {
      const claimParts = statementDescriptionSegments[currentSegmentPointer + statementCount].split(' ');
      const subjectID = convertToNumber(claimParts[0]);
      const assertedCondition = convertToNumber(claimParts[1]);

      // Store subject ID as 0-indexed for array consistency.
      currentParticipantStatementList.push([subjectID - 1, assertedCondition]);
    }
    participantClaims.push(currentParticipantStatementList);
    currentSegmentPointer += numberOfStatements; // Move the pointer past all statements for this participant.
  }

  // This variable will hold the highest number of truthful individuals found.
  let greatestTruthfulCount = 0;

  // Helper function to count set bits (1s) in a binary number.
  // Implemented using Brian Kernighan's algorithm for efficiency and variation.
  const countSetBits = (binaryMask) => {
    let setBits = 0;
    let temporaryMask = binaryMask;
    // Ensure input is non-negative, as bitmasks typically are.
    if (temporaryMask < 0) {
        // Depending on requirements, could throw error or return 0.
        return 0;
    }
    while (temporaryMask > 0) {
      temporaryMask &= (temporaryMask - 1); // Clears the least significant set bit.
      setBits++;
    }
    return setBits;
  };

  // We employ a bitmask approach to check all possible combinations of who is truthful.
  // Each bit in the mask corresponds to a participant (0 = liar, 1 = truthful).
  // Total combinations are 2^totalParticipants.
  const maximumMaskValue = (1 << totalParticipants) - 1;

  // Iterate through all possible truthfulness patterns, starting from the one with most truthful individuals.
  // This allows for an early pruning optimization.
  for (let truthPattern = maximumMaskValue; truthPattern >= 0; truthPattern--) {
    const currentPatternTruthfulCount = countSetBits(truthPattern);

    // Optimization: If the current pattern has fewer truthful individuals than
    // our best result so far, it cannot be a new maximum, so skip consistency check.
    if (currentPatternTruthfulCount <= greatestTruthfulCount) {
      continue;
    }

    let isThisPatternValid = true; // Flag to determine consistency for the current truthPattern.

    // Systematically check each participant's claims against the assumed truthPattern.
    for (let speakerIndex = 0; speakerIndex < totalParticipants; speakerIndex++) {
      // Determine if the current speaker is assumed to be truthful in this pattern.
      const speakerAssumedTruthful = (truthPattern >> speakerIndex) & 1; // 1 if truthful, 0 if liar.
      const speakerStatements = participantClaims[speakerIndex];

      // Analyze each statement made by the current speaker.
      for (let claim of speakerStatements) {
        const targetPersonIndex = claim[0];
        const assertedStatusOfTarget = claim[1]; // 1 if speaker claims target is honest, 0 if liar.

        // Determine the assumed status of the target person from the current truthPattern.
        const targetPersonPatternStatus = (truthPattern >> targetPersonIndex) & 1;

        // Apply the consistency rules:
        if (speakerAssumedTruthful) {
          // If the speaker is truthful, their statement MUST match the target's assumed status.
          if (assertedStatusOfTarget !== targetPersonPatternStatus) {
            isThisPatternValid = false; // Inconsistency found.
            break; // No need to check other statements from this speaker.
          }
        } else {
          // If the speaker is a liar, their statement MUST contradict the target's assumed status.
          if (assertedStatusOfTarget === targetPersonPatternStatus) {
            isThisPatternValid = false; // Inconsistency found.
            break; // No need to check other statements from this speaker.
          }
        }
      }

      // If an inconsistency was found for any speaker, this entire truthPattern is invalid.
      if (!isThisPatternValid) {
        break; // Exit the loop over speakers.
      }
    }

    // If, after checking all speakers, no inconsistencies were found,
    // this truthPattern is valid and potentially a new maximum.
    if (isThisPatternValid) {
      greatestTruthfulCount = currentPatternTruthfulCount;
    }
  }

  // Output the final computed maximum number of truthful individuals.
  console.log(greatestTruthfulCount);
}

// Standard entry point for competitive programming environments.
// Reads input from standard in, trims whitespace, and passes to the main function.
ProcessAssertions(require("fs").readFileSync("/dev/stdin", "utf8").trim());