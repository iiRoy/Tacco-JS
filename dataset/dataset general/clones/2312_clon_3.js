$(document).ready(function() {

  // Configuration and state variables for the dynamic content loading module.
  const contentConfig = {
    resourceManifestURL: '/all-content-manifest.json', // URL for the JSON file listing all content resources.
    scrollActivationThreshold: 3000, // Distance from the bottom of the document to trigger new content loading.
    contentContainerSelector: '.content-container', // Selector for the element where new content blocks are appended.
    loadingIndicatorSelector: '.loading-indicator', // Selector for the spinner/indicator shown during loading.
    contentBlockSelector: '.content-block' // Selector for individual content items within the fetched HTML.
  };

  // Internal module state flags and data.
  let contentManifest = null; // Stores the array of content URLs fetched from the manifest.
  let dataRetrievalInProgress = false; // Flag to prevent multiple simultaneous content fetches.
  let canInitiateRetrieval = true; // Overall flag to enable/disable new content fetching.
  let initialContentCount = 0; // Number of content items initially present on the page.

  // Cache jQuery selectors for performance and readability.
  const $contentContainer = $(contentConfig.contentContainerSelector);
  const $loadingIndicator = $(contentConfig.loadingIndicatorSelector);

  // --- Initial Setup and Validation ---

  // Verify essential elements are present. If not, disable the feature.
  if ($contentContainer.length === 0) {
    console.warn("Content container not found. Dynamic loading disabled.");
    canInitiateRetrieval = false;
    return; // Exit early if the main container is missing.
  }
  if ($loadingIndicator.length === 0) {
    console.info("Loading indicator not found. Dynamic loading will proceed without visual feedback.");
    // No need to disable canInitiateRetrieval for just the indicator absence.
  }

  // Determine how many items are already displayed.
  initialContentCount = $contentContainer.children().length;

  // Fetch the manifest file containing all content resource URLs.
  $.getJSON(contentConfig.resourceManifestURL, function(manifestData) {
    if (!manifestData || !Array.isArray(manifestData.contentEntries)) {
      console.error("Invalid content manifest received. Dynamic loading disabled.");
      deactivateContentLoader();
      return;
    }
    contentManifest = manifestData.contentEntries;

    // If there are no more content items available than are already visible, cease further fetching.
    if (contentManifest.length <= initialContentCount) {
      deactivateContentLoader();
    }
  }).fail(function(jqXHR, textStatus, errorThrown) {
    console.error(`Failed to load content manifest from ${contentConfig.resourceManifestURL}: ${textStatus} - ${errorThrown}`);
    deactivateContentLoader(); // Disable content loading on manifest fetch failure.
  });

  // --- Event Handling ---

  // Monitor scroll position to trigger new content loading.
  $(window).on('scroll', function() {
    // If fetching is globally disabled or already in progress, do nothing.
    if (!canInitiateRetrieval || dataRetrievalInProgress) {
      return;
    }

    const currentViewportHeight = $(window).height();
    const currentScrollPosition = $(window).scrollTop();
    const documentTotalHeight = $(document).height();

    // Calculate the bottom edge of the currently visible viewport.
    const visibleViewportBottom = currentViewportHeight + currentScrollPosition;

    // Check if the user has scrolled close enough to the bottom of the document.
    if ((documentTotalHeight - contentConfig.scrollActivationThreshold) < visibleViewportBottom) {
      console.log("Scroll threshold reached. Attempting to load more content...");
      initiateContentLoad();
    }
  });

  // --- Core Functions ---

  /**
   * Initiates the process of loading a new batch of content items.
   */
  function initiateContentLoad() {
    // Ensure the content manifest has been loaded.
    if (!contentManifest) {
      console.warn("Content manifest not yet available. Cannot load content.");
      return;
    }

    dataRetrievalInProgress = true; // Set flag to prevent re-entry.
    console.info("Initiating content retrieval process...");
    $loadingIndicator.fadeIn(200); // Show the loading spinner.

    let newlyAppendedItems = 0;
    const currentItemCount = $contentContainer.children().length;
    const itemsToFetchInBatch = initialContentCount; // Fetch the same number of items as initially present.

    // This callback is executed after each individual content item is successfully appended.
    const onSingleItemAppended = function() {
      newlyAppendedItems++;

      const nextContentIndex = currentItemCount + newlyAppendedItems;

      // Check if we've reached the end of the available content.
      if (nextContentIndex >= contentManifest.length) {
        console.log("All available content has been loaded.");
        deactivateContentLoader();
        return;
      }

      // If more items in the current batch need to be fetched, fetch the next one.
      if (newlyAppendedItems < itemsToFetchInBatch) {
        retrieveSpecificContentItem(nextContentIndex, onSingleItemAppended);
      } else {
        // The current batch is complete. Reset the fetching flag.
        dataRetrievalInProgress = false;
        $loadingIndicator.fadeOut(400); // Hide the loading spinner.
        console.log(`Finished loading batch of ${newlyAppendedItems} items.`);
      }
    };

    // Start fetching the first item of the batch.
    const startingIndex = currentItemCount + newlyAppendedItems;
    if (startingIndex < contentManifest.length) {
      retrieveSpecificContentItem(startingIndex, onSingleItemAppended);
    } else {
      console.log("No new content to load at this time.");
      deactivateContentLoader();
    }
  }

  /**
   * Fetches and appends a single content item based on its index in the manifest.
   * @param {number} index The index of the content item in the contentManifest array.
   * @param {function} completionCallback A function to call once the item is appended.
   */
  function retrieveSpecificContentItem(index, completionCallback) {
    const itemResourceURL = contentManifest[index];

    if (!itemResourceURL) {
      console.error(`Invalid content URL at index ${index}. Skipping.`);
      completionCallback(); // Still call back to continue the sequence.
      return;
    }

    $.get(itemResourceURL, function(itemMarkup) {
      // Find the specific content block within the fetched HTML and append it.
      $(itemMarkup).find(contentConfig.contentBlockSelector).appendTo($contentContainer);
      console.log(`Appended content item from URL: ${itemResourceURL}`);
      completionCallback();
    }).fail(function(jqXHR, textStatus, errorThrown) {
      console.error(`Failed to retrieve content from ${itemResourceURL}: ${textStatus} - ${errorThrown}`);
      // Decide if failure to load one item should stop the whole batch or just skip this one.
      // For now, we'll continue the sequence by calling the callback.
      completionCallback();
    });
  }

  /**
   * Permanently disables further content fetching and hides the loading indicator.
   */
  function deactivateContentLoader() {
    canInitiateRetrieval = false;
    dataRetrievalInProgress = false;
    if ($loadingIndicator.length > 0) {
      $loadingIndicator.fadeOut(600); // Smoothly fade out the spinner.
    }
    console.log("Dynamic content loader has been deactivated.");
  }

});