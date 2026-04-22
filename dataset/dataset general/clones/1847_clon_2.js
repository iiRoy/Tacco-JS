if (document.querySelector) {
  // Retrieve the main container for the image gallery using its CSS class.
  var visualDisplay = document.querySelector('.gallery');

  // Proceed with enhancement only if the gallery container exists on the page.
  if (visualDisplay) {
    visualDisplay.className += ' is-enhanced'; // Add a class to indicate JavaScript enhancement.

    var activeUnitIndex; // Variable to store the index of the currently visible image/figure.
    var galleryItems = visualDisplay.querySelectorAll('figure'); // Collection of all individual visual components within the gallery.

    // Create the navigation button for going to the previous item.
    var priorNavBtn = document.createElement('a');
    priorNavBtn.rel = 'prev'; // Semantic relationship for previous.
    priorNavBtn.href = '#'; // Prevents page reload/jump on click.
    priorNavBtn.innerHTML = '&#9664;'; // Unicode character for a left arrow.
    priorNavBtn.title = 'Previous Image'; // Tooltip for accessibility.
    visualDisplay.appendChild(priorNavBtn); // Attach the previous button to the gallery container.

    // Create the navigation button for going to the next item.
    var subsequentNavBtn = document.createElement('a');
    subsequentNavBtn.rel = 'next'; // Semantic relationship for next.
    subsequentNavBtn.href = '#'; // Prevents page reload/jump on click.
    subsequentNavBtn.innerHTML = '&#9654;'; // Unicode character for a right arrow.
    subsequentNavBtn.title = 'Next Image'; // Tooltip for accessibility.
    visualDisplay.appendChild(subsequentNavBtn); // Attach the next button to the gallery container.

    // A utility function to bind event listeners, mimicking the original 'addEvent'.
    function attachListener(element, eventType, callbackFunction) {
      element.addEventListener(eventType, callbackFunction);
    }

    // Attach a click event handler to the 'previous' navigation button.
    attachListener(priorNavBtn, 'click', function(actionEvent) {
      var desiredUnitIndex = activeUnitIndex - 1; // Calculate the index for the previous item.
      if (desiredUnitIndex < 0) {
        desiredUnitIndex = galleryItems.length - 1; // Wrap around to the last item if at the beginning.
      }
      showUnit(desiredUnitIndex); // Display the newly calculated item.
      actionEvent.preventDefault(); // Stop the default action of the anchor tag.
    });

    // Attach a click event handler to the 'next' navigation button.
    attachListener(subsequentNavBtn, 'click', function(actionEvent) {
      var desiredUnitIndex = activeUnitIndex + 1; // Calculate the index for the next item.
      if (desiredUnitIndex > galleryItems.length - 1) {
        desiredUnitIndex = 0; // Wrap around to the first item if at the end.
      }
      showUnit(desiredUnitIndex); // Display the newly calculated item.
      actionEvent.preventDefault(); // Stop the default action of the anchor tag.
    });

    // Core function to update which visual unit is currently displayed.
    function showUnit(targetIndex) {
      // Only perform updates if the target index is different from the current active one.
      if (targetIndex !== activeUnitIndex) {
        // If there was a previously active unit, remove its 'active' class.
        if (galleryItems[activeUnitIndex]) {
          galleryItems[activeUnitIndex].className = galleryItems[activeUnitIndex].className.replace(' active', '');
        }
        // Add the 'active' class to the newly targeted unit.
        galleryItems[targetIndex].className += ' active';
        activeUnitIndex = targetIndex; // Update the global active index.
      }
    }

    // Initialize the gallery by displaying the very first item upon load.
    showUnit(0);
  }
}