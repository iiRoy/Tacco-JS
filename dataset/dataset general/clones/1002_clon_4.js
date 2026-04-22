// It is assumed that a global 'Card' constructor exists
// and behaves like: new Card({key: 'someKey'})

class UnitCollection {
    #registryId;
    #collectionLabel;
    #activeUnitIndex;
    #baseUnitOrder; // Corresponds to original's master_set
    #currentUnitSequence; // Corresponds to original's cards

    constructor(registryIdentifier) {
        this.#registryId = registryIdentifier;
        let persistedData = null;
        try {
            const storedValue = window.localStorage.getItem(registryIdentifier);
            if (storedValue) {
                persistedData = JSON.parse(storedValue);
            }
        } catch (e) {
            // If parsing fails, treat as no persisted data
            console.error("Issue encountered parsing stored collection data for identifier:", registryIdentifier, e);
            persistedData = null;
        }

        this.#collectionLabel = (persistedData && typeof persistedData.label === 'string') ? persistedData.label : registryIdentifier;
        this.#activeUnitIndex = 0; // Original explicitly sets to 0, not from saved state.
        this.#baseUnitOrder = (persistedData && Array.isArray(persistedData.baseOrder)) ? [...persistedData.baseOrder] : [];
        this.#currentUnitSequence = [...this.#baseUnitOrder]; // Shallow copy
    }

    // Corresponds to Deck.prototype.add
    appendUnit(itemReference) {
        this.#baseUnitOrder.push(itemReference.key);
        this.#currentUnitSequence.push(itemReference.key);
    }

    // Corresponds to Deck.prototype.length
    get unitCount() {
        return this.#currentUnitSequence.length;
    }

    // Corresponds to Deck.prototype.current
    retrieveActiveUnit() {
        const totalUnits = this.unitCount;

        if (totalUnits === 0) {
            return null;
        }

        // Adjust index to be within bounds, modifying the internal state
        if (this.#activeUnitIndex < 0) {
            this.#activeUnitIndex = 0;
        }
        if (this.#activeUnitIndex >= totalUnits) {
            this.#activeUnitIndex = totalUnits - 1;
        }

        const identifier = this.getActiveUnitIdentifier();
        // Assuming Card class is available globally.
        return new Card({ 'key': identifier });
    }

    // Corresponds to Deck.prototype.currentKey
    getActiveUnitIdentifier() {
        // Assumes #activeUnitIndex is already within bounds, as adjusted by retrieveActiveUnit, advancePosition, recedePosition, etc.
        // If #currentUnitSequence is empty, this will return undefined, which is consistent with accessing an out-of-bounds array element.
        return this.#currentUnitSequence[this.#activeUnitIndex];
    }

    // Corresponds to Deck.prototype.deleteAllCards
    purgeAllUnits() {
        // Collect all unique keys to delete from localStorage before modifying internal arrays
        const keysToRemove = [...new Set([...this.#baseUnitOrder, ...this.#currentUnitSequence])];

        // Clear internal arrays
        this.#baseUnitOrder = [];
        this.#currentUnitSequence = [];
        this.#activeUnitIndex = 0; // Reset index

        // Remove each key from localStorage
        keysToRemove.forEach(k => {
            if (k !== undefined && k !== null) { // Only remove if key is valid
                window.localStorage.removeItem(k);
            }
        });

        this.persistState(); // Save the new, empty state
    }

    // Corresponds to Deck.prototype.deleteCard
    discardActiveUnit() {
        if (this.unitCount === 0) {
            return;
        }

        const currentUnitKey = this.getActiveUnitIdentifier();

        // Remove from localStorage
        if (currentUnitKey !== undefined && currentUnitKey !== null) {
            window.localStorage.removeItem(currentUnitKey);
        }

        // Remove from base order (using filter for functional style)
        this.#baseUnitOrder = this.#baseUnitOrder.filter(key => key !== currentUnitKey);

        // Remove from current sequence (using filter to create a new array)
        this.#currentUnitSequence = this.#currentUnitSequence.filter((_, idx) => idx !== this.#activeUnitIndex);

        // If the current sequence becomes empty after deletion, restore from base order
        // This replicates the original logic: if this.cards <= 0 (i.e., length 0), restore from master_set.
        if (this.#currentUnitSequence.length === 0 && this.#baseUnitOrder.length > 0) {
            this.#currentUnitSequence = [...this.#baseUnitOrder];
        }

        // Adjust index if it's now out of bounds or if the list is empty
        if (this.unitCount > 0) {
            if (this.#activeUnitIndex >= this.unitCount) {
                this.#activeUnitIndex = this.unitCount - 1;
            }
        } else {
            this.#activeUnitIndex = 0; // If no units, index is 0
        }

        this.persistState();
    }

    // Corresponds to Deck.prototype.next
    advancePosition() {
        if (this.unitCount === 0) {
            this.#activeUnitIndex = 0;
            return;
        }
        this.#activeUnitIndex = (this.#activeUnitIndex + 1) % this.unitCount;
    }

    // Corresponds to Deck.prototype.prev
    recedePosition() {
        if (this.unitCount === 0) {
            this.#activeUnitIndex = 0;
            return;
        }
        // JavaScript's % operator can return negative for negative dividends.
        // Add unitCount before modulo to ensure a non-negative result.
        this.#activeUnitIndex = (this.#activeUnitIndex - 1 + this.unitCount) % this.unitCount;
    }

    // Corresponds to Deck.prototype.shuffle
    mixUnits() {
        // Fisher-Yates (Knuth) shuffle algorithm for a distinct approach
        let currentIdx = this.#currentUnitSequence.length;
        let randomIdx;

        // While there remain elements to shuffle.
        while (currentIdx !== 0) {
            // Pick a remaining element.
            randomIdx = Math.floor(Math.random() * currentIdx);
            currentIdx--;

            // And swap it with the current element using array destructuring.
            [this.#currentUnitSequence[currentIdx], this.#currentUnitSequence[randomIdx]] =
            [this.#currentUnitSequence[randomIdx], this.#currentUnitSequence[currentIdx]];
        }
    }

    // Corresponds to Deck.prototype.save
    persistState() {
        const stateToSave = {
            label: this.#collectionLabel,
            // The original constructor only uses 'name' and 'master_set' from saved data.
            // 'index' is reset to 0, and 'cards' is derived from 'master_set'.
            // So, we only need to save the data that the constructor actually loads.
            baseOrder: this.#baseUnitOrder,
        };
        window.localStorage.setItem(this.#registryId, JSON.stringify(stateToSave, null, 2));
    }
}