function createPixelEvaluator(specificationSet, pixelSourceProvider) {
    // Helper function for deep cloning objects and arrays to ensure state isolation
    const makeDeepCopy = (sourceItem) => {
        if (sourceItem === null || typeof sourceItem !== 'object') {
            return sourceItem;
        }
        if (Array.isArray(sourceItem)) {
            return sourceItem.map(element => makeDeepCopy(element));
        }
        const targetItem = {};
        for (const keyIdentifier in sourceItem) {
            if (Object.prototype.hasOwnProperty.call(sourceItem, keyIdentifier)) {
                targetItem[keyIdentifier] = makeDeepCopy(sourceItem[keyIdentifier]);
            }
        }
        return targetItem;
    };

    // Deep copy the input configuration to ensure isolation from external changes
    const internalSpecifications = makeDeepCopy(specificationSet);
    // The provider of pixel data, expected to have a 'px(x, y)' method
    const dataAccess = pixelSourceProvider;

    // Internal state variables, managed by closure
    let currentSampledPixels = []; // Stores pixel data fetched by fetchCurrentPixels
    let evaluationRecords = [];    // Stores the boolean results of individual tolerance checks

    // Helper function: Checks if a value falls within a specified numerical range
    const isWithinInterval = (valueCandidate, lowerBound, upperBound) => !(valueCandidate < lowerBound || valueCandidate > upperBound);

    // Initializes the pixel analysis criteria, pre-calculating absolute tolerance ranges
    const initializeCriteria = () => {
        internalSpecifications.forEach((specEntry, entryIndex) => {
            // Ensure offset coordinates are defined, defaulting to [0, 0]
            if (!specEntry.offsetCoordinates) {
                specEntry.offsetCoordinates = [0, 0];
            }

            // Obtain reference pixel if not already set
            if (!specEntry.referencePoint) {
                specEntry.referencePoint = dataAccess.px(specEntry.offsetCoordinates[0], specEntry.offsetCoordinates[1]);
            }

            // Process tolerance settings if they exist
            if (specEntry.toleranceSettings) {
                evaluationRecords[entryIndex] = {}; // Initialize result object for this entry
                for (const criterionKey in specEntry.toleranceSettings) {
                    if (Object.prototype.hasOwnProperty.call(specEntry.toleranceSettings, criterionKey)) {
                        let currentCriterionRange = specEntry.toleranceSettings[criterionKey];

                        // Convert single number tolerance to a [min, max] array if needed
                        if (typeof currentCriterionRange === "number") {
                            currentCriterionRange = [-currentCriterionRange, currentCriterionRange];
                            specEntry.toleranceSettings[criterionKey] = currentCriterionRange; // Update the config with the array
                        }

                        // Get the reference value for the current criterion, handling methods vs properties
                        const referenceValue = typeof specEntry.referencePoint[criterionKey] === "function"
                            ? specEntry.referencePoint[criterionKey]()
                            : specEntry.referencePoint[criterionKey];

                        // Adjust tolerance range to be absolute values based on the reference
                        currentCriterionRange[0] += referenceValue;
                        currentCriterionRange[1] += referenceValue;
                    }
                }
            }
        });
    };

    // Fetches and stores the current pixel data for all specified points
    const fetchCurrentPixels = () => {
        currentSampledPixels = internalSpecifications.map(specEntry =>
            dataAccess.px(specEntry.offsetCoordinates[0], specEntry.offsetCoordinates[1])
        );
    };

    // Performs the complete validation check against all defined criteria
    const validateAllCriteria = () => {
        fetchCurrentPixels(); // First, get the latest pixel samples

        let overallValidationStatus = true; // Assume success until a check fails

        internalSpecifications.forEach((specEntry, entryIndex) => {
            const definedToleranceSet = specEntry.toleranceSettings;
            const currentPixelSample = currentSampledPixels[entryIndex];
            const currentRecordEntry = evaluationRecords[entryIndex];

            if (definedToleranceSet) {
                for (const propertyIdentifier in definedToleranceSet) {
                    if (Object.prototype.hasOwnProperty.call(definedToleranceSet, propertyIdentifier)) {
                        // Get the observed pixel property value, handling methods vs properties
                        const pixelPropertyObservation = typeof currentPixelSample[propertyIdentifier] === "function"
                            ? currentPixelSample[propertyIdentifier]()
                            : currentPixelSample[propertyIdentifier];
                        const allowedBounds = definedToleranceSet[propertyIdentifier];

                        // Perform the range check
                        const individualCheckResult = isWithinInterval(pixelPropertyObservation, allowedBounds[0], allowedBounds[1]);

                        // Store the individual check result
                        if (currentRecordEntry) { // Ensure the entry exists before assigning
                            currentRecordEntry[propertyIdentifier] = individualCheckResult;
                        }

                        // If any check fails, the overall status becomes false
                        if (!individualCheckResult) {
                            overallValidationStatus = false;
                        }
                    }
                }
            }
        });

        return overallValidationStatus;
    };

    // Execute initial setup upon creation of the evaluator instance, mimicking constructor behavior
    initializeCriteria();

    // Return the public interface of the pixel evaluator instance
    return {
        performValidation: validateAllCriteria,
        // Provide access to the detailed evaluation records, returning a deep copy
        // to prevent external modification of internal state, consistent with
        // the original's `this.res` being a property on the instance.
        getDetailedRecords: () => makeDeepCopy(evaluationRecords),
    };
}