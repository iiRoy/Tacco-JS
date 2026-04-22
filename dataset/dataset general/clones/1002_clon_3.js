/**
 * @file FlashcardCollection.js
 * @description Manages a collection of flashcards, including their order, state, and persistence.
 * This module provides a robust mechanism for handling learning material sets.
 */

// Define a constant for the default starting position.
const DEFAULT_START_POSITION = 0;

// The main constructor for our flashcard collection entity.
function FlashcardCollection(uniqueIdentifier) {
    // Basic validation for the identifier.
    if (!uniqueIdentifier || typeof uniqueIdentifier !== 'string') {
        console.error("A valid string identifier is required for FlashcardCollection.");
        throw new Error("Invalid collection identifier provided.");
    }

    // Assign the immutable unique ID for this collection instance.
    this._uniqueId = uniqueIdentifier;

    let loadedState = {};
    const rawData = localStorage.getItem(this._uniqueId);

    // Attempt to load previously saved state from local storage.
    if (rawData) {
        try {
            loadedState = JSON.parse(rawData);
        } catch (parsingError) {
            console.warn(`Issue encountered while parsing stored data for collection "${this._uniqueId}":`, parsingError);
            // Revert to an empty state if parsing fails.
            loadedState = {};
        }
    }

    // Initialize display name; use loaded name or the identifier as a fallback.
    this._displayName = loadedState.collectionName || this._uniqueId;

    // Initialize the primary, unadulterated list of flashcard IDs.
    // This list represents the original order in which flashcards were added.
    this._sourceItems = loadedState.sourceItems || [];

    // Initialize the currently active list of flashcard IDs.
    // This list can be reordered (e.g., shuffled) independently of _sourceItems.
    this._currentViewItems = loadedState.currentViewItems || this._sourceItems.slice();

    // The current index pointer for the active flashcard.
    // Note: The original implementation explicitly reset index to 0 on load,
    // so we replicate that behavior here, ignoring any saved index.
    this._activeIdx = DEFAULT_START_POSITION;

    // A flag to indicate if the current view order has been randomized.
    this._isOrderRandomized = loadedState.isShuffled ?? false;
}

/**
 * Adds a new flashcard's identifier to the collection.
 * The flashcard is appended to both the original source list and the current view list.
 * @param {object} flashcard A flashcard object, expected to have a 'key' property.
 */
FlashcardCollection.prototype.addItem = function(flashcard) {
    if (!flashcard || typeof flashcard.key === 'undefined') {
        console.warn("Attempted to add an invalid flashcard object (missing 'key').");
        return;
    }
    const flashcardId = flashcard.key;
    this._sourceItems.push(flashcardId);
    this._currentViewItems.push(flashcardId);
    this.saveState(); // Persist changes immediately.
};

/**
 * Retrieves the flashcard object corresponding to the current active index.
 * Returns null if the collection is empty.
 * @returns {object|null} A new Card object or null.
 */
FlashcardCollection.prototype.getCurrentFlashcard = function() {
    if (this.size() <= DEFAULT_START_POSITION) {
        return null; // No flashcards available.
    }

    // Ensure the index is always within valid bounds.
    this._ensureIndexWithinBounds();

    // Assuming a global or imported 'Card' class exists that accepts an object with an 'id'.
    return new Card({ id: this.getActiveFlashcardId() });
};

/**
 * Returns the unique identifier of the flashcard currently at the active index.
 * @returns {string|undefined} The ID of the current flashcard, or undefined if none.
 */
FlashcardCollection.prototype.getActiveFlashcardId = function() {
    return this._currentViewItems[this._activeIdx];
};

/**
 * Completely removes all flashcards from this collection and from local storage.
 * Resets both the source and current view item lists.
 */
FlashcardCollection.prototype.purgeAllFlashcards = function() {
    // Iterate and remove each flashcard from storage individually.
    // This ensures associated data is also cleared.
    while (this.size() > DEFAULT_START_POSITION) {
        const currentId = this.getActiveFlashcardId();
        if (currentId) {
            localStorage.removeItem(currentId);
        }
        // Remove from the internal lists.
        this._sourceItems.splice(this._sourceItems.indexOf(currentId), 1);
        this._currentViewItems.splice(this._activeIdx, 1);
        // No need to call this.advance() here as splice handles index shift.
        // We just ensure _activeIdx doesn't go out of bounds after deletion.
        this._ensureIndexWithinBounds();
    }
    // After deletion loop, ensure lists are truly empty.
    this._sourceItems = [];
    this._currentViewItems = [];
    this._activeIdx = DEFAULT_START_POSITION;
    this._isOrderRandomized = false;
    this.saveState(); // Save the empty state.
};

/**
 * Removes the flashcard at the current active index from the collection.
 * Also removes its corresponding entry from local storage.
 */
FlashcardCollection.prototype.removeCurrentFlashcard = function() {
    if (this.size() <= DEFAULT_START_POSITION) {
        console.log("Cannot remove flashcard from an empty collection.");
        return; // Nothing to remove.
    }

    // Ensure index is valid before proceeding.
    this._ensureIndexWithinBounds();

    const currentFlashcardId = this.getActiveFlashcardId();

    // Remove from local storage.
    localStorage.removeItem(currentFlashcardId);

    // Remove from the original source list.
    const sourceIndex = this._sourceItems.indexOf(currentFlashcardId);
    if (sourceIndex > -1) {
        this._sourceItems.splice(sourceIndex, 1);
    }

    // Remove from the current view list.
    this._currentViewItems.splice(this._activeIdx, 1);

    // If the current view list becomes empty after removal,
    // and there are still items in the source list, reset the view.
    if (this._currentViewItems.length === DEFAULT_START_POSITION && this._sourceItems.length > DEFAULT_START_POSITION) {
        this._currentViewItems = this._sourceItems.slice();
        this._isOrderRandomized = false; // Reset shuffle status if view is restored.
    }

    // Adjust the active index if it's now out of bounds.
    this._ensureIndexWithinBounds();

    this.saveState(); // Persist changes.
};

/**
 * Returns the total number of flashcards in the currently active view list.
 * @returns {number} The count of flashcards.
 */
FlashcardCollection.prototype.size = function() {
    return this._currentViewItems.length;
};

/**
 * Advances the active index to the next flashcard in the sequence.
 * Wraps around to the beginning if the end of the list is reached.
 */
FlashcardCollection.prototype.advance = function() {
    if (this.size() === DEFAULT_START_POSITION) {
        return; // No flashcards to advance through.
    }
    this._activeIdx = (this._activeIdx + 1) % this.size();
};

/**
 * Moves the active index to the previous flashcard in the sequence.
 * Wraps around to the end if the beginning of the list is reached.
 */
FlashcardCollection.prototype.retreat = function() {
    if (this.size() === DEFAULT_START_POSITION) {
        return; // No flashcards to retreat through.
    }
    this._activeIdx = (this._activeIdx - 1 + this.size()) % this.size();
};

/**
 * Randomizes the order of flashcards in the current view list.
 * The original source list remains untouched.
 */
FlashcardCollection.prototype.randomizeOrder = function() {
    if (this.size() <= 1) {
        return; // No need to shuffle if 0 or 1 card.
    }

    // A common, albeit not perfectly uniform, shuffling method using Array.prototype.sort.
    this._currentViewItems.sort(() => Math.random() - 0.5);
    this._activeIdx = DEFAULT_START_POSITION; // Reset index after shuffling.
    this._isOrderRandomized = true;
    this.saveState(); // Persist the new order.
};

/**
 * Resets the current view order to match the original source order.
 * This effectively undoes any randomization.
 */
FlashcardCollection.prototype.resetViewOrder = function() {
    if (this._isOrderRandomized) {
        this._currentViewItems = this._sourceItems.slice();
        this._activeIdx = DEFAULT_START_POSITION;
        this._isOrderRandomized = false;
        this.saveState();
    }
};

/**
 * Ensures the _activeIdx is always within the valid range [0, size-1].
 * Adjusts it if it's out of bounds, typically after deletions.
 * @private
 */
FlashcardCollection.prototype._ensureIndexWithinBounds = function() {
    const currentSize = this.size();
    if (currentSize === DEFAULT_START_POSITION) {
        this._activeIdx = DEFAULT_START_POSITION;
        return;
    }
    if (this._activeIdx < DEFAULT_START_POSITION) {
        this._activeIdx = DEFAULT_START_POSITION;
    } else if (this._activeIdx >= currentSize) {
        this._activeIdx = currentSize - 1;
    }
};

/**
 * Persists the current state of the collection to local storage.
 * Only saves essential properties for reconstruction.
 */
FlashcardCollection.prototype.saveState = function() {
    // Construct an object with properties relevant for saving.
    const stateToStore = {
        collectionName: this._displayName,
        activeIndex: this._activeIdx,
        sourceItems: this._sourceItems,
        currentViewItems: this._currentViewItems,
        isShuffled: this._isOrderRandomized
    };
    localStorage.setItem(this._uniqueId, JSON.stringify(stateToStore, null, 2));
};

// Assuming 'Card' is globally available or imported elsewhere.
// Example placeholder for 'Card' if it's not defined globally:
/*
function Card(data) {
    this.id = data.id;
    // Potentially load other card data based on ID
    // console.log("Card instantiated with ID:", this.id);
}
*/