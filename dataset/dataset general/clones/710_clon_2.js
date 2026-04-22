jQuery(function() {

  /*
   * Utility function to preprocess a given URL path string.
   * Removes leading slashes, common index/default filenames, and trailing slashes.
   */
  function normalizeUrlSegment(inputPathString) {
    return inputPathString

      .replace(/^\//, '') // Strip initial slash
      .replace(/(index|default).[a-zA-Z]{3,4}$/, '') // Remove common default file names
      .replace(/\/$/, ''); // Trim final slash
  }

  // Determine the cleaned path for the current document's URL
  var currentDocumentPath = normalizeUrlSegment(document.location.pathname);
  // Identify the primary scrollable element (e.g., html or body)
  var primaryScroller = identifyScrollableElement('html', 'body');

  // Locate all anchor elements containing a hash in their href attribute
  jQuery('a[href*="#"]').each(function() {

    // For each potential internal link:
    // Obtain the normalized path for the current anchor element
    var linkNormalizedPath = normalizeUrlSegment(this.pathname) || currentDocumentPath;

    // Check if the link points to the same page, potentially same host, and has a valid hash
    if (  currentDocumentPath === linkNormalizedPath
      && (document.location.hostname === this.hostname || !this.hostname)
      && this.hash.replace(/#/, '') ) {

          // If it's a valid internal link, get the target element
          var $destinationItem = jQuery(this.hash), targetHashRef = this.hash;

          if ($destinationItem.length) { // Ensure the target element actually exists on the page

            // Calculate the vertical position of the target element
            var destinationYCoordinate = $destinationItem.offset().top;

            // Attach a click event handler to the current anchor link
            jQuery(this).on('click', function(domEvent) {

              // Prevent the browser's default jump behavior
              domEvent.preventDefault();

              // Smoothly animate the scroll to the target's Y-coordinate
              jQuery(primaryScroller).animate({scrollTop: destinationYCoordinate}, 550, function() {

                // Once the animation concludes, update the URL hash to reflect the new position
                document.location.hash = targetHashRef;
              });
            });
          }
      }

  });

  /*
   * Discovers the first element among the provided arguments that is capable of scrolling.
   * This handles cross-browser inconsistencies regarding which element (html or body) actually scrolls.
   */
  function identifyScrollableElement(potentialScrollers) {
    for (var idx = 0, totalArguments = arguments.length; idx < totalArguments; idx++) {
      var currentDomItem = arguments[idx],
      $candidateForScroll = jQuery(currentDomItem);

      if ($candidateForScroll.scrollTop() > 0) {
        return currentDomItem; // This element is already scrolled, so it's scrollable
      } else {
        $candidateForScroll.scrollTop(1); // Try to scroll it by 1 pixel
        var hasScrollCapability = $candidateForScroll.scrollTop() > 0; // Check if it actually scrolled
        $candidateForScroll.scrollTop(0); // Reset scroll position
        if (hasScrollCapability) {
          return currentDomItem; // This element can scroll
        }
      }
    }
    return []; // No scrollable element found among candidates
  }

});