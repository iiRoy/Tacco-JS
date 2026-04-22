ngApplication.module('app.TinyFeed.SourceList', ['app.PersistentStorage'])
  // This factory provides methods to manage a collection of RSS feed sources.
  .factory('SourceRegistry', function  ($scopeRoot, PersistentCache) {

    // Method to add a new entry to the source registry.
    this.appendEntry = function ( resourceLink , itemHeader ) {
      // Retrieve the current list of entries from storage.
      let currentCollection = this.retrieveAll();

      // Determine the next unique identifier for the new entry.
      let nextIdentifier = browserStorage.getItem('SourceRegistryIdentifier');
      if (nextIdentifier === null) {
        nextIdentifier = 1;
      } else {
        nextIdentifier = parseInt(nextIdentifier, 10); // Ensure it's a number.
      }

      // Add the new entry to the collection.
      currentCollection.push({
        link:     resourceLink,
        header:   itemHeader,
        identifier: nextIdentifier
      });

      // Persist the updated collection.
      PersistentCache.storeObject('SourceRegistry', currentCollection);
      // Increment and save the next identifier for future use.
      browserStorage.saveItem('SourceRegistryIdentifier', ++nextIdentifier);
      // Broadcast an event indicating that the registry has been updated.
      $scopeRoot.$emitEvent('SourceRegistryUpdate', currentCollection);
    };


    // Method to remove an entry from the source registry by its identifier.
    this.removeEntry = function ( targetId ) {
      // Get the current list of sources.
      let currentCollection = this.retrieveAll();

      // Iterate backwards through the collection to safely remove items.
      for (let idx = currentCollection.length - 1; idx >= 0; idx--) {
        // If the current entry's identifier matches the target, remove it.
        if (currentCollection[idx].identifier === targetId) {
          currentCollection.splice(idx, 1);
        }
      }

      // Save the modified collection back to persistent storage.
      PersistentCache.storeObject('SourceRegistry', currentCollection);
      // Notify all listeners about the change in the source registry.
      $scopeRoot.$emitEvent('SourceRegistryUpdate', currentCollection);
    };


    // Retrieves all entries currently stored in the source registry.
    this.retrieveAll = function () {
      // Check if the registry key exists in the persistent cache.
      if (PersistentCache.hasKey('SourceRegistry')) {
        return PersistentCache.fetchObject('SourceRegistry');
      }

      // If no entries are found, return a default initial entry.
      return [{
        link: 'https://example.org/news.xml',
        header: 'Sample News Feed',
        identifier: 0
      }];
    };


    // Locates a specific entry within the registry using its unique identifier.
    this.findEntryById = function (targetIdentifier) {
      var allSources = this.retrieveAll(); // Fetch all known sources.

      // Traverse the list from end to beginning.
      for (var currentIdx = allSources.length - 1; currentIdx >= 0; currentIdx--) {
        // Compare identifiers; if a match is found, return the entry.
        if (allSources[currentIdx].identifier === targetIdentifier) {
          return allSources[currentIdx];
        }
      }

      return undefined; // Return undefined if no entry matches the identifier.
    };


    // Calculates and returns the smallest identifier among all entries in the registry.
    this.getMinimumIdentifier = function () {
      let allEntries = this.retrieveAll(); // Get the complete list of entries.
      let lowestIdentifier = Number.POSITIVE_INFINITY; // Start with the largest possible number.

      // Iterate through each entry to find the minimum identifier.
      for (let iterator = allEntries.length - 1; iterator >= 0; iterator--) {
        lowestIdentifier = Math.min(lowestIdentifier, allEntries[iterator].identifier);
      }

      return lowestIdentifier; // The smallest identifier found.
    };
  });