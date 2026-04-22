const EventNexus = require('events').EventEmitter;

// Default utility for extracting a sort key from an item.
// This function expects its 'this' context to be an instance of ManagedDataView,
// allowing it to access '_underlyingSource'.
const extractDefaultSortKey = (dataItem) => {
    // A robust check for the 'this' context and required method.
    // If the context is missing or the method is not found, it falls back to item ID.
    // This is an added guard clause (Type III).
    if (!this || typeof this._underlyingSource?.getIdentifierIndex !== 'function') {
        console.warn("ManagedDataView: Default sort key extractor context or method missing. Falling back to item ID.");
        return dataItem.id;
    }
    return this._underlyingSource.getIdentifierIndex(dataItem.id);
};

// A predicate function that always returns true, effectively allowing all items.
const defaultInclusionPredicate = (dataItem) => {
    // This function simply accepts any data item.
    return true;
};

// Custom binary search implementation to find the correct insertion point
// for an item in a sorted array, based on a key extractor.
// This replaces external library dependency and is a significant Type III structural addition.
const obtainSortedInsertionPoint = (targetArray, prospectiveItem, keyProducer) => {
    let lowerBound = 0;
    let upperBound = targetArray.length;
    const prospectiveKey = keyProducer(prospectiveItem);

    while (lowerBound < upperBound) {
        const midPoint = Math.floor((lowerBound + upperBound) / 2);
        const midItemKey = keyProducer(targetArray[midPoint]);

        // Adjust bounds based on key comparison.
        if (midItemKey < prospectiveKey) {
            lowerBound = midPoint + 1;
        } else {
            upperBound = midPoint;
        }
    }
    return lowerBound;
};

/**
 * A sophisticated view manager that observes changes in a primary data source
 * and maintains a filtered, sorted collection of its items.
 * It extends EventNexus (renamed EventEmitter) to publish updates about its own state.
 */
class ManagedDataView extends EventNexus {
    /**
     * Initializes a new instance of the ManagedDataView.
     * @param {object} primaryDataSource - The observable data source (must have EventNexus-like methods and a 'collection' property).
     * @param {function} [initialFilterPredicate=defaultInclusionPredicate] - The initial function to filter items.
     * @param {function} [initialSortKeyProducer=extractDefaultSortKey] - The initial function to extract sort keys from items.
     */
    constructor(primaryDataSource, initialFilterPredicate = defaultInclusionPredicate, initialSortKeyProducer = extractDefaultSortKey) {
        super(); // Call the constructor of EventNexus (parent class)

        // Validate the primary data source to ensure it's usable. (Guard clause - Type III)
        if (!primaryDataSource || typeof primaryDataSource.on !== 'function' || typeof primaryDataSource.off !== 'function' || !Array.isArray(primaryDataSource.collection)) {
            throw new Error("Invalid primary data source provided. It must be an EventNexus-like object with 'on', 'off' methods, and a 'collection' array.");
        }

        // Store a reference to the observed data source.
        this._underlyingSource = primaryDataSource;

        // Bind internal handler methods to this instance.
        // This ensures they always execute with the correct 'this' context.
        this._onSourceItemAdded = this.processNewItem.bind(this);
        this._onSourceItemModified = this.processModifiedItem.bind(this);
        this._onSourceItemRemoved = this.processRemovedItem.bind(this);
        this._onSourceDataRefreshed = this.rebuildViewCollection.bind(this);

        // Subscribe to events from the primary data source.
        this._underlyingSource.on("itemAdded", this._onSourceItemAdded);
        this._underlyingSource.on("itemUpdated", this._onSourceItemModified);
        this._underlyingSource.on("itemDeleted", this._onSourceItemRemoved);
        this._underlyingSource.on("sourceRecalculated", this._onSourceDataRefreshed);

        // Store and bind the filter and sort key functions.
        // Binding ensures they can access 'this._underlyingSource' if needed.
        this._activeFilterPredicate = initialFilterPredicate.bind(this);
        this._activeSortKeyProducer = initialSortKeyProducer.bind(this);

        // Initialize the view's internal collection.
        this.rebuildViewCollection(); // Perform an initial population.
    }

    /**
     * Cleans up the view by detaching all event listeners.
     * This prevents memory leaks when the view is no longer needed.
     */
    disposeView() {
        // Unsubscribe from primary data source events.
        this._underlyingSource.off("itemAdded", this._onSourceItemAdded);
        this._underlyingSource.off("itemUpdated", this._onSourceItemModified);
        this._underlyingSource.off("itemDeleted", this._onSourceItemRemoved);
        this._underlyingSource.off("sourceRecalculated", this._onSourceDataRefreshed);

        // Remove all listeners from this view instance.
        this.removeAllListeners();

        // Nullify references to aid garbage collection (Type III addition).
        this._underlyingSource = null;
        this._cachedOrderedItems = null;
    }

    /**
     * Reconstructs and re-sorts the internal collection based on the current
     * filter and sort criteria. Can optionally update these criteria.
     * @param {function} [newFilterFunc] - An optional new filter predicate.
     * @param {function} [newSortKeyFunc] - An optional new sort key producer.
     */
    rebuildViewCollection(newFilterFunc, newSortKeyFunc) {
        // Update filter and sort functions if new ones are provided.
        // Use '||' for fallback logic, consistent with original.
        const currentFilter = newFilterFunc || this._activeFilterPredicate;
        const currentSorter = newSortKeyFunc || this._activeSortKeyProducer;

        // Re-bind the functions to this instance for correct context.
        this._activeFilterPredicate = currentFilter.bind(this);
        this._activeSortKeyProducer = currentSorter.bind(this);

        // Apply the filter to the source's collection.
        // Assuming 'primaryDataSource.collection' holds the raw items.
        let temporaryFilteredItems = this._underlyingSource.collection.filter(this._activeFilterPredicate);

        // Sort the filtered items.
        temporaryFilteredItems.sort((firstItem, secondItem) => {
            const keyOne = this._activeSortKeyProducer(firstItem);
            const keyTwo = this._activeSortKeyProducer(secondItem);

            // Detailed comparison logic (Type III rewriting).
            if (keyOne < keyTwo) {
                return -1;
            } else if (keyOne > keyTwo) {
                return 1;
            }
            return 0; // Items are considered equal for sorting purposes.
        });

        // Update the internal ordered list.
        this._cachedOrderedItems = temporaryFilteredItems;

        // Notify subscribers that the view has been refreshed.
        this.emit("viewUpdated");
    }

    /**
     * Determines the appropriate insertion index for an item within the current
     * sorted view, using a binary search approach.
     * @param {object} itemForPlacement - The item to find the position for.
     * @returns {number} The index where the item should be inserted.
     */
    determineInsertionIndex(itemForPlacement) {
        return obtainSortedInsertionPoint(this._cachedOrderedItems, itemForPlacement, this._activeSortKeyProducer);
    }

    /**
     * Handles an item being added to the primary data source.
     * If the item passes the current filter, it's inserted into the view.
     * @param {object} incomingItem - The item that was added.
     */
    processNewItem(incomingItem) {
        // Validate item structure (Type III guard clause).
        if (!incomingItem || typeof incomingItem.id === 'undefined') {
            console.warn("ManagedDataView: Received an invalid item for addition:", incomingItem);
            return;
        }

        // Check if the item should be included in this view.
        if (this._activeFilterPredicate(incomingItem)) {
            const targetIndex = this.determineInsertionIndex(incomingItem);

            // Optimize for appending to the end of the list.
            if (targetIndex === this._cachedOrderedItems.length) {
                this._cachedOrderedItems.push(incomingItem);
            } else {
                // Insert at the calculated sorted position.
                this._cachedOrderedItems.splice(targetIndex, 0, incomingItem);
            }
            this.emit("itemAddedToView", incomingItem, targetIndex);
        }
    }

    /**
     * Handles an item being modified in the primary data source.
     * Updates the item's state or position in the view, or adds/removes it as necessary.
     * @param {object} alteredItem - The item that was modified.
     */
    processModifiedItem(alteredItem) {
        // Validate item structure (Type III guard clause).
        if (!alteredItem || typeof alteredItem.id === 'undefined') {
            console.warn("ManagedDataView: Received an invalid item for modification:", alteredItem);
            return;
        }

        // Find the item's current position in the view by ID.
        // Using Array.prototype.findIndex for a more modern and readable approach (Type III).
        const currentViewIndex = this._cachedOrderedItems.findIndex(item => item.id === alteredItem.id);

        const shouldBeInView = this._activeFilterPredicate(alteredItem);

        if (currentViewIndex === -1) {
            // Item is not currently in the view.
            if (shouldBeInView) {
                // It now meets criteria, so add it.
                this.processNewItem(alteredItem);
            }
            // If it's not in view and shouldn't be, do nothing.
        } else {
            // Item is currently in the view.
            if (!shouldBeInView) {
                // It no longer meets criteria, so remove it.
                this.processRemovedItem(alteredItem.id);
            } else {
                // Still in view and passes filter. Check if sort position changed.
                const oldSortValue = this._activeSortKeyProducer(this._cachedOrderedItems[currentViewIndex]);
                const newSortValue = this._activeSortKeyProducer(alteredItem);

                if (oldSortValue !== newSortValue) {
                    // Sort order has changed, so re-position the item.
                    // This is achieved by removing and then re-adding it.
                    this.processRemovedItem(alteredItem.id);
                    this.processNewItem(alteredItem);
                } else {
                    // Sort order is unchanged, simply update the item's data in place.
                    this._cachedOrderedItems[currentViewIndex] = alteredItem;
                    this.emit("itemUpdatedInView", alteredItem, currentViewIndex);
                }
            }
        }
    }

    /**
     * Handles an item being removed from the primary data source.
     * Removes the item from the view if it was present.
     * @param {any} itemIdentifier - The unique ID of the item to be removed.
     */
    processRemovedItem(itemIdentifier) {
        // Validate identifier (Type III guard clause).
        if (typeof itemIdentifier === 'undefined' || itemIdentifier === null) {
            console.warn("ManagedDataView: Received an invalid identifier for removal:", itemIdentifier);
            return;
        }

        // Find the index of the item to remove.
        const removalIndex = this._cachedOrderedItems.findIndex(item => item.id === itemIdentifier);

        if (removalIndex !== -1) {
            // Remove the item from the cached list.
            this._cachedOrderedItems.splice(removalIndex, 1);
            this.emit("itemRemovedFromView", itemIdentifier, removalIndex);
        }
        // If the item wasn't found, it means it wasn't in this view, so no action needed.
    }

    /**
     * Public getter to retrieve a snapshot of the currently viewed items.
     * Returns a shallow copy to prevent external modification of the internal array.
     * @returns {Array<object>} A copy of the items currently in the view.
     */
    get currentViewItems() {
        return [...this._cachedOrderedItems]; // Return a shallow copy (Type III addition).
    }
}

// Export the class for module consumers.
module.exports = {
    ManagedDataView: ManagedDataView
};