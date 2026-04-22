class DataLedger {
  #identificationMap; // Map<key, Symbol(entryMarker)> maps an external key to a unique internal marker
  #entryCollection;   // Map<Symbol(entryMarker), { contentValue: any, previousMarker: Symbol | null, nextMarker: Symbol | null }> stores the actual entry details
  #listHeadMarker;    // Symbol | null, marker of the first entry in sequence
  #listTailMarker;    // Symbol | null, marker of the last entry in sequence
  #currentScanPosition; // Symbol | null, marker of the entry *before* the one to be returned by sequenceStep()

  constructor() {
    this.#identificationMap = new Map();
    this.#entryCollection = new Map();
    this.#listHeadMarker = null;
    this.#listTailMarker = null;
    this.#currentScanPosition = null;
    this.itemCount = 0; // Renamed 'len' to 'itemCount'
  }

  // Corresponds to original 'set' method
  register(keyIdentifier, contentData) {
    if (this.#identificationMap.has(keyIdentifier)) {
      return; // Original behavior: do nothing if key already exists
    }

    const entryMarker = Symbol(); // Unique identifier for this entry
    const newEntryDetails = {
      contentValue: contentData,
      previousMarker: this.#listTailMarker, // Link to the current last entry's marker
      nextMarker: null,
    };

    this.#entryCollection.set(entryMarker, newEntryDetails);
    this.#identificationMap.set(keyIdentifier, entryMarker);

    if (this.itemCount === 0) {
      this.#listHeadMarker = entryMarker;
      this.#listTailMarker = entryMarker;
      this.resetScanner(); // Original calls rwd() on first item set
    } else {
      // Update the previous last entry's nextMarker to point to the new entry
      const oldTailDetails = this.#entryCollection.get(this.#listTailMarker);
      if (oldTailDetails) { // Should always be true if itemCount > 0
        oldTailDetails.nextMarker = entryMarker;
        this.#entryCollection.set(this.#listTailMarker, oldTailDetails); // Update the entry in the map
      }
      this.#listTailMarker = entryMarker;
    }
    this.itemCount++;
  }

  // Corresponds to original 'del' method
  remove(keyIdentifier) {
    const entryMarker = this.#identificationMap.get(keyIdentifier);
    if (!entryMarker) {
      return undefined; // Original returns undefined if node doesn't exist
    }

    const detailsToRemove = this.#entryCollection.get(entryMarker);
    const removedContent = detailsToRemove.contentValue;

    const prevMarker = detailsToRemove.previousMarker;
    const nextMarker = detailsToRemove.nextMarker;

    // Update the nextMarker of the previous entry to bypass the removed entry
    if (prevMarker) {
      const prevDetails = this.#entryCollection.get(prevMarker);
      if (prevDetails) {
        prevDetails.nextMarker = nextMarker;
        this.#entryCollection.set(prevMarker, prevDetails);
      }
    } else { // This was the first entry
      this.#listHeadMarker = nextMarker;
    }

    // Update the previousMarker of the next entry to bypass the removed entry
    if (nextMarker) {
      const nextDetails = this.#entryCollection.get(nextMarker);
      if (nextDetails) {
        nextDetails.previousMarker = prevMarker;
        this.#entryCollection.set(nextMarker, nextDetails);
      }
    } else { // This was the last entry
      this.#listTailMarker = prevMarker;
    }

    this.#identificationMap.delete(keyIdentifier); // Remove key mapping
    // Crucially, the entry details are NOT removed from #entryCollection,
    // only its links are updated by its neighbors. This allows the iterator
    // to still traverse through it if #currentScanPosition points to it,
    // matching the original's behavior where node.n remains accessible.
    this.itemCount--;

    return removedContent;
  }

  // Corresponds to original 'get' method
  fetch(keyIdentifier) {
    const entryMarker = this.#identificationMap.get(keyIdentifier);
    if (!entryMarker) {
      return undefined; // Original returns undefined if key not found (or null if deleted)
    }
    // Original returns the node object. We return the entry details object.
    return this.#entryCollection.get(entryMarker);
  }

  // Corresponds to original 'itr' method
  sequenceStep() {
    if (this.#currentScanPosition === null) {
      // If scanner is at the start (or reset), move to the first entry
      this.#currentScanPosition = this.#listHeadMarker;
    } else {
      // Move to the next entry in the sequence
      const currentEntryDetails = this.#entryCollection.get(this.#currentScanPosition);
      if (currentEntryDetails) {
        this.#currentScanPosition = currentEntryDetails.nextMarker;
      } else {
        // This case should ideally not happen if #entryCollection is not cleared on deletion
        // but it means the current position was invalid. Treat as end of list.
        this.#currentScanPosition = null;
      }
    }
    // Return the entry details or undefined if at the end of the list
    return this.#entryCollection.get(this.#currentScanPosition);
  }

  // Corresponds to original 'rwd' method
  resetScanner() {
    this.#currentScanPosition = null; // Represents the state *before* the first entry
  }

  // Corresponds to original 'empty' method
  clearAll() {
    this.#identificationMap = new Map();
    this.#entryCollection = new Map(); // Clears all entries, including 'ghost' ones
    this.#listHeadMarker = null;
    this.#listTailMarker = null;
    this.#currentScanPosition = null;
    this.itemCount = 0;
  }
}