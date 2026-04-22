(function () {
    // This module handles the registration and validation of new game console systems.

    /**
     * Internal helper function to thoroughly validate a candidate game system object.
     * Ensures all required properties are present, values are in correct format,
     * and the system identifier is unique among existing systems.
     * @param {object} systemDetails - The game system object to validate.
     * @returns {boolean} - True if the system details pass all validation checks, false otherwise.
     */
    let validateGameSystemEntry = function (systemDetails) {
        // Essential properties for any new game system.
        const REQUIRED_SYSTEM_PROPS = [
            'systemIdentifier', 'systemName', 'initialCost', 'soldUnits',
            'licenseFee', 'releaseDate', 'retirementDate', 'developmentBudget',
            'genreConcentrations', 'playerDemographics', 'technologicalEra', 'displayIconUri'
        ];

        // If the system details object itself is not valid, no further checks can proceed.
        if (!systemDetails || typeof systemDetails !== 'object') {
            console.error("Validation Error: System details object is null or not an object.");
            return false;
        }

        let allChecksPassed = true; // Accumulate validation results.

        // --- Initial property and uniqueness checks ---
        if (!ValidationService.ensureAllAttributesExist(systemDetails, REQUIRED_SYSTEM_PROPS)) {
            console.warn("Validation Warning: Missing one or more required properties for system:", systemDetails.systemName || systemDetails.systemIdentifier);
            allChecksPassed = false;
        }

        // Renamed 'id' to 'systemIdentifier' for clarity and to demonstrate Type III change.
        if (!ValidationService.verifyUniqueness(systemDetails, 'systemIdentifier', GameSystems.registeredSystems)) {
            console.warn("Validation Warning: System identifier already in use:", systemDetails.systemIdentifier);
            allChecksPassed = false;
        }

        // Renamed 'audienceWeightings' to 'playerDemographics' and 'genreWeightings' to 'genreConcentrations'.
        if (!ValidationService.validatePlayerDemographics(systemDetails.playerDemographics)) {
            console.warn("Validation Warning: Invalid player demographics data for system:", systemDetails.systemName);
            allChecksPassed = false;
        }

        if (!ValidationService.validateGenreConcentrations(systemDetails.genreConcentrations)) {
            console.warn("Validation Warning: Invalid genre concentrations data for system:", systemDetails.systemName);
            allChecksPassed = false;
        }

        // --- Date format checks for primary system dates ---
        // Renamed 'published' to 'releaseDate' and 'platformRetireDate' to 'retirementDate'.
        if (!ValidationService.isValidDate(systemDetails.releaseDate)) {
            console.warn("Validation Warning: Invalid release date format for system:", systemDetails.systemName);
            allChecksPassed = false;
        }

        if (!ValidationService.isValidDate(systemDetails.retirementDate)) {
            console.warn("Validation Warning: Invalid retirement date format for system:", systemDetails.systemName);
            allChecksPassed = false;
        }

        // --- Conditional checks for market milestones ---
        // Renamed 'marketPoints' to 'marketMilestones'.
        if (systemDetails.marketMilestones && Array.isArray(systemDetails.marketMilestones)) {
            // Using a traditional for loop to iterate and check, similar to original but with renamed variables.
            for (let milestoneIndex = 0; milestoneIndex < systemDetails.marketMilestones.length; milestoneIndex++) {
                const currentMilestone = systemDetails.marketMilestones[milestoneIndex];
                if (!currentMilestone || !ValidationService.isValidDate(currentMilestone.milestoneDate)) {
                    console.warn(`Validation Warning: Invalid milestone date for market milestone at index ${milestoneIndex} of system:`, systemDetails.systemName);
                    allChecksPassed = false;
                    // We can break early here if we want to fail fast for milestones
                    // break;
                }
            }
        } else if (systemDetails.marketMilestones !== undefined && systemDetails.marketMilestones !== null) {
            // Guard clause for non-array marketMilestones
            console.warn("Validation Warning: marketMilestones property exists but is not an array for system:", systemDetails.systemName);
            allChecksPassed = false;
        }

        return allChecksPassed; // Return the accumulated validation status.
    };


    /**
     * Registers a new game system into the GameDevTycoon ecosystem after validation.
     * @param {object} newSystemData - The data object for the new game system.
     */
    GameDevTycoon.registerGameSystem = function (newSystemData) {
        // First, ensure the provided data is valid.
        if (!validateGameSystemEntry(newSystemData)) {
            console.error("Failed to register game system due to validation errors:", newSystemData.systemName || newSystemData.systemIdentifier || "Unnamed System");
            return; // Abort if validation fails.
        }

        // If validation passes, add the system to the global registry.
        GameSystems.registeredSystems.push(newSystemData);
        console.log(`Successfully registered new game system: ${newSystemData.systemName} (ID: ${newSystemData.systemIdentifier})`);

        // If the system comes with associated events, register them as well.
        // Renamed 'events' to 'associatedEvents'.
        if (newSystemData.associatedEvents && Array.isArray(newSystemData.associatedEvents)) {
            console.info(`Registering ${newSystemData.associatedEvents.length} associated events for ${newSystemData.systemName}...`);
            // Using forEach for event registration, demonstrating an alternative loop style.
            newSystemData.associatedEvents.forEach(function (eventItem, eventIdx) {
                GameDevTycoon.addGameEvent(eventItem);
                console.debug(`Event ${eventIdx + 1} for ${newSystemData.systemName} added.`);
            });
        } else if (newSystemData.associatedEvents !== undefined && newSystemData.associatedEvents !== null) {
            // Adding a warning for malformed event data.
            console.warn(`System ${newSystemData.systemName} has an 'associatedEvents' property but it's not an array.`);
        }
        // No events to add is also a valid scenario.
    };

})();