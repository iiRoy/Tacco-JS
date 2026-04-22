const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

((sourceData) => {
    // Early exit for empty or invalid input data
    if (!sourceData || sourceData.trim().length === 0) {
        console.log(-1);
        return;
    }

    // Split the raw input string into an array of lines, removing any trailing empty lines
    const dataRows = sourceData.trim().split("\n");

    // Parse the first line to get the fundamental problem parameters
    const paramValues = dataRows[0].split(" ").map(val => parseInt(val, 10));
    const numPublications = paramValues[0]; // Total count of available learning materials
    const numCompetencies = paramValues[1]; // Total count of distinct knowledge areas
    const minCompetencyThreshold = paramValues[2]; // Minimum required proficiency level for each knowledge area

    // Prepare a structured array to hold details for each publication
    const publicationDetails = [];

    // Iterate through the remaining data rows to populate publication details
    // Each publication has a price and an array of proficiency increments
    for (let currentPubIdx = 0; currentPubIdx < numPublications; ++currentPubIdx) {
        const lineData = dataRows[currentPubIdx + 1].split(" ").map(val => parseInt(val, 10));
        const publicationPrice = lineData[0];
        const publicationProficiencies = lineData.slice(1); // The rest are proficiency values

        publicationDetails.push({
            price: publicationPrice,
            proficiencies: publicationProficiencies
        });
    }

    // --- Combination Generation Subsystem (Recursive Backtracking Implementation) ---
    // This array will store all valid subsets of publication indices
    const selectedPublicationSets = [];

    /**
     * Recursive function to generate all non-empty combinations of publication indices.
     * @param {number} startingIndex - The index from which to consider publications for the current combination.
     * @param {number[]} currentCombination - The array representing the combination being built in the current recursion.
     */
    const recursivelyGenerateCombinations = (startingIndex, currentCombination) => {
        // If the current combination is not empty, it's a valid set to consider
        if (currentCombination.length > 0) {
            selectedPublicationSets.push([...currentCombination]); // Store a deep copy
        }

        // Explore adding subsequent publications
        for (let nextCandidateIdx = startingIndex; nextCandidateIdx < numPublications; ++nextCandidateIdx) {
            currentCombination.push(nextCandidateIdx); // Add the candidate publication's index
            recursivelyGenerateCombinations(nextCandidateIdx + 1, currentCombination); // Recurse for further additions
            currentCombination.pop(); // Backtrack: remove the last added publication to explore other paths
        }
    };

    // Initiate the combination generation process
    recursivelyGenerateCombinations(0, []);
    // --- End of Combination Generation ---

    // Variable to track the minimum cost found that satisfies all conditions
    let minimumSatisfyingCost = Infinity;

    // --- Evaluation of Each Generated Publication Set ---
    // Iterate through each combination of publications.
    for (const currentSetOfIndices of selectedPublicationSets) {
        let cumulativeSetCost = 0; // Total monetary investment for this specific set
        // Initialize an array to accumulate proficiency levels across all competencies for the current set
        let accumulatedProficiencyLevels = new Array(numCompetencies).fill(0);

        // Process each individual publication within the current set
        for (const publicationIdxInSet of currentSetOfIndices) {
            const publication = publicationDetails[publicationIdxInSet]; // Retrieve full publication data

            cumulativeSetCost += publication.price; // Add publication's cost

            // Sum up the proficiency levels for each competency
            for (let competencyOffset = 0; competencyOffset < numCompetencies; ++competencyOffset) {
                // Defensive check to avoid out-of-bounds access if data format is inconsistent
                if (competencyOffset < publication.proficiencies.length) {
                    accumulatedProficiencyLevels[competencyOffset] += publication.proficiencies[competencyOffset];
                }
            }
        }

        // --- Competency Requirement Verification ---
        let allRequirementsMet = true; // Flag to determine if this set is viable
        // Check if every competency's accumulated level meets the minimum threshold
        for (let competencyOffset = 0; competencyOffset < numCompetencies; ++competencyOffset) {
            if (accumulatedProficiencyLevels[competencyOffset] < minCompetencyThreshold) {
                allRequirementsMet = false; // A requirement is not met
                break; // No need to check further, this set is invalid
            }
        }

        // If all competency requirements are satisfied by this set, update the minimum cost
        if (allRequirementsMet) {
            minimumSatisfyingCost = Math.min(minimumSatisfyingCost, cumulativeSetCost);
        }
    }

    // --- Final Result Output ---
    // If 'minimumSatisfyingCost' remains Infinity, it implies no combination met the criteria.
    // Output -1 in that scenario, otherwise output the calculated minimum cost.
    console.log(minimumSatisfyingCost === Infinity ? -1 : minimumSatisfyingCost);

})(rawData); // Execute the main processing function with the raw input data