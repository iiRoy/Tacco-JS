// This module defines a utility for preloading visual assets.
function VisualAssetPreparer( assetMappings, onAllReady ) {

  // Initialize internal counters for tracking progress.
  this.totalItemsExpected = 0;
  this.itemsSuccessfullyLoaded = 0;

  // A collection to hold the actual loaded image objects.
  this.assetStorage = {};
  // The function to invoke when all assets have completed loading.
  this.onAllReady = onAllReady;

  // First pass: Calculate the total number of assets to be loaded.
  for ( let assetIdentifier in assetMappings ) {
    this.totalItemsExpected++; // Increment for each entry in the map.
  }

  // Preserve 'this' context for use within asynchronous event handlers.
  const selfReference = this;

  // Second pass: Initiate the loading process for each asset.
  for ( let assetIdentifier in assetMappings ) {
    // Create a new HTML image element for the current asset.
    selfReference.assetStorage[assetIdentifier] = new Image();
    // Set the source attribute, which begins the image download.
    selfReference.assetStorage[assetIdentifier].src = assetMappings[assetIdentifier];

    // Assign an event listener for when the image finishes loading.
    selfReference.assetStorage[assetIdentifier].onload = function () {
      // Increment the count of items that have successfully loaded.
      selfReference.itemsSuccessfullyLoaded++;

      // Check if the number of loaded items now matches the total expected.
      if ( selfReference.itemsSuccessfullyLoaded === selfReference.totalItemsExpected ) {
        // If all assets are loaded, execute the predefined completion handler.
        selfReference.onAllReady();
      }
    };
  }

  // Provides a public method to check if all content has been loaded.
  this.hasAllContentLoaded = function() {
    // Returns true if loaded count equals total expected count.
    return this.itemsSuccessfullyLoaded === this.totalItemsExpected;
  };
}