/*
 * itemCollection.js
 * Describes a Collection class to manage groups of flashcards.
 * A collection tracks references to Flashcard objects and their display order.
 */

// Constructor for the Collection object
function Collection(identifierString) {
    this.identifierString = identifierString;
    var loadedData; // Temporary variable for deserialized data

    // Check for previously saved state or initialize with defaults
    if (localStorage[identifierString]) {
        loadedData = JSON.parse(localStorage[identifierString]);
    } else {
        loadedData = {}; // Empty object if no saved state
    }

    this.title = (loadedData.name) ? loadedData.name : this.identifierString;
    // The current position within the collection, always starting at zero for consistency
    this.currentPosition = 0;

    // The comprehensive set of all items, in their original addition sequence.
    // This list serves as the unadulterated source for the collection.
    this.sourceItems = (loadedData.master_set) ? loadedData.master_set : []; // Changed data type initialization

    // The array representing the current display order of items, potentially modified by operations like shuffling.
    this.activeItems = this.sourceItems.slice();
}

// Method to append a new item to the end of the collection
Collection.prototype.addItem = function(itemToAdd) {
    this.sourceItems.push(itemToAdd.itemId);
    this.activeItems.push(itemToAdd.itemId);
};

// Retrieves the item at the current position in the collection
Collection.prototype.getCurrentItem = function() {
    // If there are no items in the collection, return nothing
    if (this.getItemCount() <= 0) {
        return null;
    }

    // Adjust the current position if it falls outside valid bounds
    if (this.currentPosition < 0) {
        this.currentPosition = 0;
    }
    if (this.currentPosition >= this.getItemCount()) {
        this.currentPosition = this.getItemCount() - 1;
    }

    // Instantiate and return a new Flashcard object using the current item's ID
    return new Flashcard({
        'id': this.getCurrentItemIdentifier()
    });
};

// Provides the unique identifier for the item at the current position
Collection.prototype.getCurrentItemIdentifier = function() {
    return this.activeItems[this.currentPosition];
};

// Removes all items from the collection permanently
Collection.prototype.clearAllItems = function() {
    while (this.getItemCount() > 0) {
        this.deleteCurrentItem();
        this.advancePosition();
    }
    // Ensure the changes are saved after all deletions
    this.persistState();
};

// Deletes the item currently pointed to by the current position
Collection.prototype.deleteCurrentItem = function() {
    if (this.getItemCount() <= 0) {
        return; // Nothing to delete if the collection is empty
    }

    // Remove the item's data from local storage using its identifier
    localStorage.removeItem(this.getCurrentItemIdentifier());

    // Remove the item's identifier from both the source and active item lists
    const currentId = this.getCurrentItemIdentifier();
    this.sourceItems.splice(this.sourceItems.indexOf(currentId), 1);
    this.activeItems.splice(this.currentPosition, 1);

    // If the active list becomes empty after deletion,
    // re-populate it from the source list to maintain consistency, but only if source has items.
    if (this.activeItems.length <= 0 && this.sourceItems.length > 0) {
        this.activeItems = this.sourceItems.slice();
    }
    this.persistState(); // Save the updated collection state
};

// Returns the total number of items currently in the active collection
Collection.prototype.getItemCount = function() {
    return this.activeItems.length;
};

// Moves the current position to the next item in the collection, wrapping around if at the end
Collection.prototype.advancePosition = function() {
    this.currentPosition++;
    if (this.currentPosition >= this.getItemCount()) {
        this.currentPosition = 0; // Wrap to the beginning
    }
};

// Moves the current position to the previous item in the collection, wrapping around if at the beginning
Collection.prototype.recedePosition = function() {
    this.currentPosition--;
    if (this.currentPosition < 0) {
        this.currentPosition = this.getItemCount() - 1; // Wrap to the end
    }
};

// Randomizes the order of items within the active collection
Collection.prototype.randomizeOrder = function() {
    this.activeItems.sort(function() {
        return 0.5 - Math.random();
    });
};

// Stores the current state of this collection into local storage
Collection.prototype.persistState = function() {
    localStorage[this.identifierString] = JSON.stringify(this, null, 4); // Changed indentation to 4 spaces
};