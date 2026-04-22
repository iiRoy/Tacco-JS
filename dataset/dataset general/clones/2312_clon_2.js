jQuery( document ) . ready( function( ) {

  /*
   * Initialize crucial variables for dynamic content loading.
   * articleLinks: Stores the URLs for all available content pieces.
   * loadingInProgress: A boolean flag indicating if content retrieval is currently active.
   * canInitiateLoad: A boolean flag to control whether new content can be fetched.
   * initialItemsCount: The number of content items initially displayed on the page.
   * scrollTriggerDistance: The pixel distance from the document's bottom to trigger a new load.
   */
  var articleLinks,
      loadingInProgress   = !1,
      canInitiateLoad     = !0,
      initialItemsCount   = jQuery( ".articles-wrapper" ).children().length,
      scrollTriggerDistance = 3000;

  // Retrieve the JSON manifest containing all content resource links.
  jQuery.getJSON( '/all-entries-manifest.json', function( responsePayload ) {
    articleLinks = responsePayload[ "entries" ];

    // If the total available items are less than or equal to what's already shown,
    // disable further loading to prevent unnecessary requests.
    if ( articleLinks.length <= initialItemsCount ) {
      deactivateRetrieval();
    }
  } );

  // Check for the presence of a visual scroll indicator.
  // If no indicator is found, it implies this page isn't set up for infinite scrolling.
  if ( jQuery( ".scroll-indicator" ).length < 1 ) {
    canInitiateLoad = false;
  }

  // Attach a scroll event listener to the browser window.
  // This function continuously monitors the user's scroll position.
  jQuery( window ).on( 'scroll', function( scrollEvent ) {
    // If content fetching is not permitted or already active, exit immediately.
    if ( !canInitiateLoad || loadingInProgress ) {
      return;
    }

    var viewportHeight        = jQuery( window ).height(),
        verticalScrollOffset  = jQuery( window ).scrollTop(),
        viewportBottom        = viewportHeight + verticalScrollOffset,
        totalDocumentHeight   = jQuery( document ).height();

    // Determine if the user has scrolled close enough to the bottom to trigger a new content load.
    if ( ( totalDocumentHeight - scrollTriggerDistance ) < viewportBottom ) {
      retrieveContentItems();
    }
  } );

  /**
   * Function: retrieveContentItems
   * Initiates the process of fetching a batch of new content items.
   * It ensures that content links are available before proceeding.
   */
  function retrieveContentItems() {
    // Abort if the content link manifest hasn't been loaded yet.
    if ( !articleLinks ) {
      return;
    }

    loadingInProgress = true;

    // Load a quantity of items equivalent to the initial display count.
    // Each item's successful retrieval triggers the loading of the next.
    let retrievedCount     = 0;
    const displayedItemCount = jQuery( ".articles-wrapper" ).children().length;
    const itemProcessedCallback = function() {
      retrievedCount++;
      const nextItemPosition = displayedItemCount + retrievedCount;

      // If all available items have been loaded, disable further retrieval.
      if ( nextItemPosition > articleLinks.length - 1 ) {
        deactivateRetrieval();
        return;
      }

      // If more items are still needed for this batch, fetch the next one.
      if ( retrievedCount < initialItemsCount ) {
        fetchItemByIndex( nextItemPosition, itemProcessedCallback );
      } else {
        // Otherwise, the current batch is complete; reset the loading flag.
        loadingInProgress = false;
      }
    };

    // Begin fetching the first item of the new batch.
    fetchItemByIndex( displayedItemCount + retrievedCount, itemProcessedCallback );
  }

  /**
   * Function: fetchItemByIndex
   * Retrieves a single content item based on its index in the articleLinks array.
   *
   * @param {number} itemIdx - The numerical index of the item to fetch.
   * @param {Function} completionCb - A callback function to execute upon successful retrieval.
   */
  function fetchItemByIndex( itemIdx, completionCb ) {
    const contentLink = articleLinks[ itemIdx ];

    jQuery.get( contentLink, function( retrievedHtml ) {
      // Find the specific content block within the retrieved HTML and append it.
      jQuery( retrievedHtml ).find( ".article-entry" ).appendTo( ".articles-wrapper" );
      completionCb(); // Execute the callback to signal completion.
    } );
  }

  /**
   * Function: deactivateRetrieval
   * Halts all content loading operations.
   * Resets flags and hides the visual loading indicator.
   */
  function deactivateRetrieval() {
    canInitiateLoad   = false;
    loadingInProgress = false;
    jQuery( ".scroll-indicator" ).fadeOut( 500 ); // Fade out over half a second.
  }

} );