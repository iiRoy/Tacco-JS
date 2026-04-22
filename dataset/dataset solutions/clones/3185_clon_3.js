function AnalyzeParticipantSelections(rawInputString) {

    // Divide the comprehensive input string into individual data entries, line by line.
    const dataSegments = rawInputString.split("\n");

    // Extract the primary configuration values from the initial data segment.
    // These values dictate the overall scope of the analysis.
    const configurationTokens = dataSegments[0].split(" ");
    const totalParticipantCount = Number(configurationTokens[0]); // Denotes 'N' participants.
    const availableCategoryCount = Number(configurationTokens[1]); // Denotes 'M' distinct categories.

    // Implement basic input validation for core parameters.
    // If 'N' or 'M' are invalid (not positive integers), an error is logged, and processing halts.
    if (isNaN(totalParticipantCount) || totalParticipantCount <= 0 ||
        isNaN(availableCategoryCount) || availableCategoryCount <= 0) {
        console.error("Input Error: The number of participants or categories must be a positive integer.");
        return;
    }

    // Initialize a data structure to store each participant's chosen items.
    // An array of Sets is used to ensure efficient checking for item presence and to handle unique selections.
    // Participant data begins from the second line of the input (index 1).
    const allParticipantSelections = [];
    for (let participantDataIndex = 1; participantDataIndex <= totalParticipantCount; participantDataIndex++) {
        // Parse the current participant's choice line. The first token is the count of items they chose.
        const currentParticipantRawChoices = dataSegments[participantDataIndex].split(" ");
        const numItemsChosenByParticipant = Number(currentParticipantRawChoices[0]);

        // A new Set is created for each participant to hold their unique item identifiers.
        const distinctChosenItems = new Set();
        for (let itemPositionInLine = 1; itemPositionInLine <= numItemsChosenByParticipant; itemPositionInLine++) {
            const itemIdentifier = Number(currentParticipantRawChoices[itemPositionInLine]);
            // Validate each item identifier before adding to the set.
            if (!isNaN(itemIdentifier) && itemIdentifier > 0) {
                distinctChosenItems.add(itemIdentifier);
            }
        }
        allParticipantSelections.push(distinctChosenItems);
    }

    // This counter will track how many categories have been selected by *all* participants.
    let categoriesUniversallySelected = 0;

    // Begin the main analysis loop: iterate through each possible category ID.
    // Categories are typically identified starting from 1.
    for (let currentCategory = 1; currentCategory <= availableCategoryCount; currentCategory++) {
        let participantsSatisfiedWithCategory = 0; // Resets for each new category.

        // Now, for the current category, check every participant's selections.
        // The 'allParticipantSelections' array is 0-indexed.
        for (let pIndex = 0; pIndex < totalParticipantCount; pIndex++) {
            const participantItemSet = allParticipantSelections[pIndex];

            // Utilize the Set's 'has' method for quick lookup to see if the participant chose this category.
            if (participantItemSet.has(currentCategory)) {
                participantsSatisfiedWithCategory++;
            }
        }

        // If the count of participants who selected this category matches the total participant count,
        // then this category is considered "universally selected".
        if (participantsSatisfiedWithCategory === totalParticipantCount) {
            categoriesUniversallySelected++;
        }
    }

    // Output the final tally of categories that meet the universal selection criteria.
    console.log(categoriesUniversallySelected);
}

// The following line is standard boilerplate for competitive programming environments
// and should not be altered, as it handles reading input and initiating the process.
AnalyzeParticipantSelections(require("fs").readFileSync("/dev/stdin", "utf8"));