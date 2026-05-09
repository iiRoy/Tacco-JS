ng.module('myApp.SyndicationSources', ['myApp.PersistentStore'])
    // The SyndicationSourceManager service provides methods for CRUD operations on feed sources.
    .factory('SyndicationSourceManager', function ($rootEventBus, PersistentStoreService) {

        // Internal helper function to retrieve the current highest identifier for a new source.
        // It fetches a counter from local storage, incrementing it for the next use.
        // If no counter exists, it initializes it to a starting value (e.g., 0).
        function fetchNextAvailableIdentifier() {
            let currentCounterValue = parseInt(localStorage.getItem('SyndicationSourceCounter') || '0', 10);
            if (isNaN(currentCounterValue) || currentCounterValue < 0) {
                currentCounterValue = 0; // Ensure a valid starting point
            }
            // Increment for the next operation and store it.
            localStorage.setItem('SyndicationSourceCounter', (currentCounterValue + 1).toString());
            return currentCounterValue + 1; // Return the *new* value
        }


        // Public API for the SyndicationSourceManager service.
        var serviceInstance = {

            /**
             * Registers a new syndication source with a given URL and title.
             * Assigns a unique identifier to the new source.
             * @param {string} feedUrl - The URL of the RSS/Atom feed.
             * @param {string} feedTitle - The display title for the feed.
             * @returns {object|null} The newly registered source object, or null if validation fails or duplicate.
             */
            registerSource: function (feedUrl, feedTitle) {
                // Input validation for URL and title
                if (!feedUrl || typeof feedUrl !== 'string' || feedUrl.trim() === '') {
                    console.error("Validation Error: Invalid or empty feed URL provided.");
                    $rootEventBus.$broadcast('SourceManager.Error', { type: 'InvalidUrl', message: 'Invalid URL provided.' });
                    return null;
                }
                if (!feedTitle || typeof feedTitle !== 'string' || feedTitle.trim() === '') {
                    console.warn("Warning: Feed title is empty. Using URL as title.");
                    feedTitle = feedUrl; // Fallback to URL if title is missing
                }

                let currentSources = serviceInstance.retrieveAllSources();

                // Check for duplicate URLs to prevent redundant entries.
                const isDuplicate = currentSources.some(src => src.feedUrl === feedUrl);
                if (isDuplicate) {
                    console.warn(`Duplicate source detected: ${feedUrl} already exists.`);
                    $rootEventBus.$broadcast('SourceManager.Warning', { type: 'DuplicateSource', message: 'Source already exists.' });
                    return null; // Do not add duplicates
                }

                const newIdentifier = fetchNextAvailableIdentifier(); // Get a unique ID
                const newSourceEntry = {
                    feedUrl: feedUrl,
                    feedTitle: feedTitle,
                    sourceId: newIdentifier,
                    addedOn: new Date().toISOString() // Add a timestamp for additional data
                };

                currentSources.push(newSourceEntry);

                // Persist the updated list of sources.
                PersistentStoreService.setObject('SyndicationSourcesRegistry', currentSources);
                // Notify listeners about the change in the source list.
                $rootEventBus.$broadcast('SyndicationSourcesUpdated', currentSources);

                return newSourceEntry;
            },

            /**
             * Removes a syndication source identified by its unique ID.
             * @param {number} identifierToRemove - The unique ID of the source to remove.
             * @returns {boolean} True if the source was found and removed, false otherwise.
             */
            removeSource: function (identifierToRemove) {
                // Ensure the identifier is a valid number.
                if (typeof identifierToRemove !== 'number' || isNaN(identifierToRemove) || identifierToRemove < 0) {
                    console.error("Removal Error: Invalid identifier provided for source removal.");
                    $rootEventBus.$broadcast('SourceManager.Error', { type: 'InvalidId', message: 'Invalid ID for removal.' });
                    return false;
                }

                let currentSources = serviceInstance.retrieveAllSources();
                let foundAndRemoved = false;

                // Filter out the source with the matching identifier.
                // This creates a new array without the specified item.
                const updatedSources = currentSources.filter(source => {
                    if (source.sourceId === identifierToRemove) {
                        foundAndRemoved = true;
                        return false; // Exclude this item
                    }
                    return true; // Include other items
                });

                if (foundAndRemoved) {
                    // Only update and broadcast if a change actually occurred.
                    PersistentStoreService.setObject('SyndicationSourcesRegistry', updatedSources);
                    $rootEventBus.$broadcast('SyndicationSourcesUpdated', updatedSources);
                    console.log(`Source with ID ${identifierToRemove} successfully removed.`);
                    return true;
                } else {
                    console.warn(`Source with ID ${identifierToRemove} not found for removal.`);
                    $rootEventBus.$broadcast('SourceManager.Warning', { type: 'NotFound', message: `Source ID ${identifierToRemove} not found.` });
                    return false;
                }
            },

            /**
             * Retrieves the entire collection of syndication sources.
             * Initializes with a default source if no sources are found in storage.
             * @returns {Array<object>} An array of syndication source objects.
             */
            retrieveAllSources: function () {
                if (PersistentStoreService.contains('SyndicationSourcesRegistry')) {
                    const storedSources = PersistentStoreService.getObject('SyndicationSourcesRegistry');
                    // Ensure the retrieved object is indeed an array.
                    if (Array.isArray(storedSources)) {
                        return storedSources;
                    } else {
                        console.error("Corrupted data: Stored 'SyndicationSourcesRegistry' is not an array. Reinitializing.");
                        // Fall through to default initialization.
                    }
                }

                // Default initial set of sources if none are found or if data is corrupted.
                const defaultSources = [{
                    feedUrl: 'http://cacodaemon.de/index.php?rss=1',
                    feedTitle: 'Cacomania Dev Blog',
                    sourceId: 0, // A fixed ID for the default entry
                    addedOn: new Date(2020, 0, 1, 12, 0, 0).toISOString() // A fixed date for the default entry
                }];
                // Optionally, persist this default list immediately.
                PersistentStoreService.setObject('SyndicationSourcesRegistry', defaultSources);
                return defaultSources;
            },

            /**
             * Finds a specific syndication source by its unique identifier.
             * @param {number} lookupIdentifier - The ID of the source to find.
             * @returns {object|null} The source object if found, otherwise null.
             */
            findSourceById: function (lookupIdentifier) {
                // Quick exit for invalid input.
                if (typeof lookupIdentifier !== 'number' || isNaN(lookupIdentifier)) {
                    console.error("Lookup Error: Invalid identifier type for source lookup.");
                    return null;
                }

                const allSources = serviceInstance.retrieveAllSources();
                // Using a traditional loop for broader compatibility in older Angular environments.
                for (let k = 0; k < allSources.length; k++) {
                    if (allSources[k].sourceId === lookupIdentifier) {
                        return allSources[k];
                    }
                }
                return null; // Source not found
            },

            /**
             * Determines the smallest numerical identifier currently in use across all sources.
             * Useful for understanding ID ranges or for specific UI logic.
             * @returns {number} The minimum source ID, or -1 if no sources are present.
             */
            getSmallestSourceId: function () {
                const currentSources = serviceInstance.retrieveAllSources();

                // If no sources exist, return a sentinel value.
                if (currentSources.length === 0) {
                    console.log("No sources available to determine minimum ID.");
                    return -1;
                }

                // Initialize minimum with the ID of the first source for efficiency.
                let minimumIdentifier = currentSources[0].sourceId;

                // Iterate through the rest of the sources to find the true minimum.
                for (let j = 1; j < currentSources.length; j++) {
                    if (currentSources[j].sourceId < minimumIdentifier) {
                        minimumIdentifier = currentSources[j].sourceId;
                    }
                }
                return minimumIdentifier;
            }
        };

        return serviceInstance; // Return the service object
    });