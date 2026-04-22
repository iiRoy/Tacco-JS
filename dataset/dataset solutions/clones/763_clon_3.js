const fileSystemHandler = require('fs'); // Utilizing Node.js file system capabilities

/**
 * Parses a string value into an integer.
 * Returns 0 if the parsing results in NaN, ensuring numeric operations are safe.
 * @param {string} valueToParse - The string to attempt parsing.
 * @returns {number} The parsed integer or 0.
 */
const safeParseInteger = (valueToParse) => {
    const numericalResult = parseInt(valueToParse, 10);
    return isNaN(numericalResult) ? 0 : numericalResult;
};

/**
 * Processes a series of election rounds from standard input.
 * Each round involves counting votes for various candidates and determining a winner
 * based on specific criteria or declaring a tie.
 */
(function conductElectionSimulation() {
    // Read the entire input stream, trim whitespace, and split into lines.
    const fullInputContent = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');
    let inputDataLines = fullInputContent.trim().split("\n");

    /**
     * Converts a candidate frequency map into a sorted array of [count, identifier] pairs.
     * The array is sorted in ascending order based on the vote count.
     * @param {Object.<string, number>} candidateTallies - An object mapping candidate identifiers to their vote counts.
     * @returns {Array<Array<number|string>>} An array of [count, identifier] pairs, sorted.
     */
    const retrieveSortedCandidateRankings = (candidateTallies) => {
        const candidateScoreboard = [];
        for (const nomineeIdentifier in candidateTallies) {
            // Ensure we are only processing own properties of the tally object.
            if (Object.prototype.hasOwnProperty.call(candidateTallies, nomineeIdentifier)) {
                candidateScoreboard.push([candidateTallies[nomineeIdentifier], nomineeIdentifier]);
            }
        }
        // Sort the candidates primarily by their vote count in ascending order.
        candidateScoreboard.sort((firstNominee, secondNominee) => firstNominee[0] - secondNominee[0]);
        return candidateScoreboard;
    };

    let roundParticipantCount; // This variable will hold the number of participants for the current round.

    // The simulation continues as long as the number of participants for a round is not zero.
    // The first line of each round specifies this count.
    while ((roundParticipantCount = safeParseInteger(inputDataLines.shift())) !== 0) {
        // The second line for each round contains space-separated identifiers of participants.
        const participantIdentifiers = inputDataLines.shift().split(" ");

        // Initialize an object to store vote frequencies for the current election round.
        const voteFrequencyTracker = {};
        let winnerDeclaredInRound = false; // Flag to indicate if a winner has been determined early.

        // Iterate through each participant's entry in the current round.
        for (let currentEntryIndex = 0; currentEntryIndex < roundParticipantCount; ++currentEntryIndex) {
            const currentParticipant = participantIdentifiers[currentEntryIndex];
            // Increment the vote count for the current participant.
            // If the participant is new, initialize their count to 0 before incrementing.
            voteFrequencyTracker[currentParticipant] = (voteFrequencyTracker[currentParticipant] || 0) + 1;

            // Get the current ranking of all participants based on their accumulated votes.
            const currentRankedParticipants = retrieveSortedCandidateRankings(voteFrequencyTracker);

            // Calculate the number of entries yet to be processed in this round.
            const remainingEntries = roundParticipantCount - (currentEntryIndex + 1);

            // Identify the top two participants. If there's only one, the second is considered to have 0 votes.
            const topRanked = currentRankedParticipants[0];
            const secondRanked = currentRankedParticipants.length > 1 ? currentRankedParticipants[1] : [0, null]; // Use null for ID if no actual second.

            // If the top two participants currently have the same number of votes, no winner can be declared yet.
            if (topRanked[0] === secondRanked[0]) {
                continue; // Move to the next participant entry.
            }

            // Check if the leading participant has a mathematically undeniable lead.
            // This occurs if their current vote count is greater than the second participant's count
            // even if all remaining votes were hypothetically awarded to the second participant.
            if (topRanked[0] > (secondRanked[0] + remainingEntries)) {
                // A clear winner has emerged. Print their identifier and the number of entries processed so far.
                console.log(`${topRanked[1]} ${currentEntryIndex + 1}`);
                winnerDeclaredInRound = true;
                break; // Exit the loop for the current round as a winner is found.
            }
        }

        // If the loop finished without declaring an early winner, it means the result is a tie.
        if (!winnerDeclaredInRound) {
            console.log("TIE");
        }
    }
})(); // End of the election simulation IIFE.