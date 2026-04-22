// This script manages interactive elements for navigation purposes.
// It ensures that all hyperlink clicks are intercepted and handled by the parent frame.

// Direct the main frame to update its display title.
topFrame.retrieveHeadline();

/*
 * Initializes the interactive elements on the current page.
 * Attaches a custom click handler to all anchor tags.
 */
function initPageNavigation() {
  var anchorElements = document.getElementsByTagName('a'); // Get all 'a' elements.
  for (var k = 0; k < anchorElements.length; k++) { // Iterate through each anchor element.
    anchorElements[k].onclick = processAnchorClick; // Assign the custom handler.
  }
}

/**
 * Handles the click event for an anchor element.
 * Prevents default navigation and informs the parent frame to navigate.
 * @param {Event} clickEvt The DOM click event object.
 * @returns {boolean} Always returns false to prevent default browser action.
 */
function processAnchorClick(clickEvt) {
  // Instruct the containing frame to change its location based on the clicked link's URL.
  topFrame.changeLocation(this.href);
  return false; // Prevent the browser from following the link normally.
}