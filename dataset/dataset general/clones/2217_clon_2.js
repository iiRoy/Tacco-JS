(function (pageContext) {
  // Flag to track if the shift key is currently being held down.
  var isShiftKeyHeld = false;

  // Key codes for important keyboard inputs.
  var KEY_INPUTS = {
    SPACEBAR: 32,
    SHIFT_KEY: 16
  };

  // Array to store words extracted from the extension response, used for navigation.
  var forwardPageWords = [];

  // Request next page navigation words from the Chrome extension.
  // The structure of the request and response names are part of the API and cannot be altered.
  chrome.extension.sendRequest({
      name: "getNextWords"
    },
    function (extensionData) {
      // Extract the raw string of words from the extension's response.
      var rawWordsString = extensionData.nextwords;

      // Determine the total length of the raw string.
      var stringLength = rawWordsString.length;
      // Temporary variable to build each word.
      var currentWordFragment = "";
      // Index for populating the forwardPageWords array.
      var wordArrayIndex = 0;

      // Iterate through the raw string to parse words separated by newlines.
      for (var charPosition = 0; charPosition < stringLength; charPosition++) {
        // Check if the current character is a newline, indicating the end of a word.
        if (rawWordsString[charPosition] === "\n") {
          // Store the completed word in the array.
          forwardPageWords[wordArrayIndex] = currentWordFragment;
          // Move to the next position in the array.
          wordArrayIndex++;
          // Reset the word fragment for the next word.
          currentWordFragment = "";
          // Skip to the next character in the string.
          continue;
        }
        // Append the current character to the word fragment.
        currentWordFragment += rawWordsString[charPosition];
      }

      // Add a global event listener for keydown events on the document.
      pageContext.addEventListener("keydown", function (keyboardEvent) {
        // Ignore key presses if the user is typing in an input or textarea field.
        if (pageContext.activeElement.tagName === "INPUT" || pageContext.activeElement.tagName === "TEXTAREA") {
          return;
        }

        // Calculate current scroll position.
        var verticalScrollPosition = Math.max(pageContext.documentElement.scrollTop, pageContext.body.scrollTop);
        // Determine the total height of the document.
        var totalDocumentHeight = Math.max(pageContext.documentElement.scrollHeight, pageContext.body.scrollHeight);
        // Get the visible height of the browser window.
        var viewportVisibleHeight = Math.min(pageContext.documentElement.clientHeight, pageContext.body.clientHeight);

        // If the user is not scrolled to the very bottom of the page, do nothing.
        if (totalDocumentHeight > (verticalScrollPosition + viewportVisibleHeight)) {
          return;
        }

        // Handle different key codes.
        switch (keyboardEvent.keyCode) {
          case KEY_INPUTS.SPACEBAR:
            // If spacebar is pressed and shift key is not held, attempt to navigate.
            if (!isShiftKeyHeld) {
              advanceToNextPage();
            }
            break;
          case KEY_INPUTS.SHIFT_KEY:
            // Set flag when shift key is pressed.
            isShiftKeyHeld = true;
            break;
          default:
            // Do nothing for other keys.
            break;
        }
      });

      // Add a global event listener for keyup events on the document.
      pageContext.addEventListener("keyup", function (keyboardEvent) {
        // Ignore key releases if the user is typing in an input or textarea field.
        if (pageContext.activeElement.tagName === "INPUT" || pageContext.activeElement.tagName === "TEXTAREA") {
          return;
        }

        // Handle different key codes for keyup events.
        switch (keyboardEvent.keyCode) {
          case KEY_INPUTS.SHIFT_KEY:
            // Clear flag when shift key is released.
            isShiftKeyHeld = false;
            break;
          default:
            // Do nothing for other keys.
            break;
        }
      });

      // Function responsible for navigating to the next page.
      function advanceToNextPage() {
        // Retrieve all <link> elements in the document.
        var headLinkElements = pageContext.getElementsByTagName("link");
        var numberOfHeadLinks = headLinkElements.length;

        // Iterate through <link> elements to find a "next" navigation link.
        for (var linkElementIndex = 0; linkElementIndex < numberOfHeadLinks; linkElementIndex++) {
          if (isNextNavigationLink(headLinkElements[linkElementIndex])) {
            // If a "next" link is found, navigate to its href.
            pageContext.location.href = headLinkElements[linkElementIndex].getAttribute("href");
            return; // Exit after finding the first one.
          }
        }

        // Retrieve all <a> (anchor) elements in the document.
        var allAnchorElements = pageContext.getElementsByTagName("a");
        var numberOfAnchorElements = allAnchorElements.length;

        // Iterate through <a> elements to find a "next" navigation anchor.
        for (linkElementIndex = 0; linkElementIndex < numberOfAnchorElements; linkElementIndex++) { // Reusing 'linkElementIndex' for consistency with original code's variable reuse.
          if (isNextNavigationAnchor(allAnchorElements[linkElementIndex])) {
            // If a "next" anchor is found, navigate to its href.
            pageContext.location.href = allAnchorElements[linkElementIndex].getAttribute("href");
            return; // Exit after finding the first one.
          }
        }
      }

      // Checks if a given <link> element is a "next" navigation link.
      function isNextNavigationLink(linkElement) {
        // Get the 'rel' attribute value.
        var relationshipAttribute = linkElement.getAttribute("rel");
        // Return true if 'rel' exists and is "next" (case-insensitive).
        return (relationshipAttribute !== null && relationshipAttribute.toLowerCase() === "next");
      }

      // Checks if a given <a> element contains "next" navigation words.
      function isNextNavigationAnchor(anchorElement) {
        // Get the count of custom forward navigation words.
        var customTermsCount = forwardPageWords.length;
        // Loop through custom words.
        for (var termIndex = 0; termIndex < customTermsCount; termIndex++) {
          // Check if the anchor's text content includes any of the custom words.
          if (anchorElement.textContent.indexOf(forwardPageWords[termIndex]) >= 0) {
            return true;
          }
        }

        // Note: The identifier 'DefaultNextWords' was renamed to 'StandardAdvanceTerms'
        // to comply with the cloning rule, assuming it refers to an external, potentially undefined, global array.
        // Get the count of standard advance terms.
        var standardTermsCount = StandardAdvanceTerms.length;
        // Loop through standard terms.
        for (var standardTermIndex = 0; standardTermIndex < standardTermsCount; standardTermIndex++) {
          // Check if the anchor's text content includes any of the standard terms.
          if (anchorElement.textContent.indexOf(StandardAdvanceTerms[standardTermIndex]) >= 0) {
            return true;
          }
        }

        // If no "next" words are found, return false.
        return false;
      }
    });

})(document);