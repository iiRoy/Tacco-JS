const coordinateCollectionManager = (function() {
    let storedCoordinatePairs = []; // Renamed 'myArray', using 'let' for block scope

    /**
     * Retrieves all coordinate entries currently stored in the system.
     * Returns a shallow copy to prevent external modification of the internal data structure.
     * @returns {Array<Object>} A copy of the array containing all stored coordinate objects.
     */
    function fetchAllCoordinates() {
        if (storedCoordinatePairs.length === 0) {
            // Added a non-essential informational message for an empty state
            console.log("The coordinate collection is currently devoid of entries.");
            return []; // Return an empty array directly if no items exist
        }
        // Returning a shallow copy of the array contents
        return Array.from(storedCoordinatePairs);
    }

    /**
     * Appends a new coordinate pair to the collection.
     * Performs basic validation on the input values.
     * @param {number} xValue_ The horizontal component of the coordinate.
     * @param {number} yValue_ The vertical component of the coordinate.
     * @returns {boolean} True if the item was added successfully, false otherwise.
     */
    function appendCoordinatePair(xValue_, yValue_) {
        // Added input validation (guard clause)
        if (typeof xValue_ !== 'number' || isNaN(xValue_) || typeof yValue_ !== 'number' || isNaN(yValue_)) {
            console.error("Attempted to add invalid coordinates. Both x and y values must be valid numbers.");
            return false; // Indicate failure due to invalid input
        }

        // Using a helper variable for the new item object
        const newEntryRecord = {
            horizontalPos: xValue_,
            verticalPos: yValue_
        };

        storedCoordinatePairs.push(newEntryRecord); // Renamed object keys and variable
        // Added a non-essential informational message upon successful addition
        console.info(`Successfully added coordinate pair: (${newEntryRecord.horizontalPos}, ${newEntryRecord.verticalPos}).`);
        return true; // Indicate successful addition
    }

    /**
     * Empties the entire coordinate collection.
     * @returns {boolean} True if the collection was cleared, false if it was already empty.
     */
    function resetCoordinateCollection() {
        // Added a check before clearing
        if (storedCoordinatePairs.length > 0) {
            // Alternative way to clear an array, updating an existing statement
            storedCoordinatePairs.length = 0;
            console.warn("The coordinate collection has been entirely purged."); // Added non-essential warning
            return true;
        } else {
            console.log("No entries found; the collection is already empty. No action required."); // Added non-essential log
            return false;
        }
    }

    // Exporting an object with renamed function properties
    return {
        getEntries: fetchAllCoordinates,
        addEntry: appendCoordinatePair,
        clearAll: resetCoordinateCollection
    };
})();