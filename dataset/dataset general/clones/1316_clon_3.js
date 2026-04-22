// This module is responsible for managing interactions with Twitter's intent pop-up windows.
// It intercepts clicks on specific links and opens them in a controlled, centered pop-up.
(function() {
  // A global flag to ensure this handler is initialized only once per page load.
  if (window._twitPopMgrActive) {
    return;
  }

  // Regular expression to identify Twitter intent URLs (e.g., twitter.com/intent/tweet).
  const popLinkPattern = /twitter\.com(?::\d{2,4})?\/intent\/(\w+)/;
  
  // Standard window features for the pop-up, ensuring it's resizable and has no extra bars.
  const popWinFeatures = 'scrollbars=yes,resizable=yes,toolbar=no,location=yes';
  
  // Define the preferred dimensions for the pop-up window.
  const desiredWidth = 550;
  const desiredHeight = 420;

  // Retrieve current screen dimensions to calculate pop-up centering.
  const screenHeight = screen.height;
  const screenWidth = screen.width;

  /**
   * Calculates the appropriate coordinate (left or top) to center a window on the screen.
   * Ensures the position is never negative.
   * @param {number} windowDimension - The width or height of the window to be centered.
   * @param {number} screenDimension - The width or height of the user's screen.
   * @returns {number} The calculated pixel position for centering.
   */
  const getCenteredPosition = (windowDimension, screenDimension) => {
    return Math.max(0, Math.round((screenDimension / 2) - (windowDimension / 2)));
  };

  /**
   * The main event handler function for document clicks.
   * It checks if a clicked element is a Twitter intent link and manages its opening.
   * @param {Event} eventObject - The native DOM event object.
   */
  function processDocumentClick(eventObject) {
    // Normalize the event object for broader browser compatibility.
    const currentEvent = eventObject || window.event;
    let clickedElement = currentEvent.target || currentEvent.srcElement;
    let matchedLinkData;
    let horizontalPos, verticalPos;

    // Traverse up the DOM tree from the clicked element until an <a> tag is found.
    while (clickedElement && clickedElement.nodeName.toLowerCase() !== 'a') {
      clickedElement = clickedElement.parentNode;
    }

    // Proceed only if a valid anchor element with an 'href' attribute was found.
    if (clickedElement && clickedElement.nodeName.toLowerCase() === 'a' && clickedElement.href) {
      matchedLinkData = clickedElement.href.match(popLinkPattern);

      // If the link's href matches the Twitter intent pattern, open the pop-up.
      if (matchedLinkData) {
        horizontalPos = getCenteredPosition(desiredWidth, screenWidth);
        verticalPos = getCenteredPosition(desiredHeight, screenHeight);

        // Assemble the complete set of window features, including calculated position.
        const fullWindowFeatures = `${popWinFeatures},width=${desiredWidth},height=${desiredHeight},left=${horizontalPos},top=${verticalPos}`;
        const targetWindowName = 'twitter_popup_share'; // A consistent name for the pop-up window.

        // Open the new window.
        window.open(clickedElement.href, targetWindowName, fullWindowFeatures);

        // Prevent the browser's default action for the link (i.e., navigating away).
        if (currentEvent.preventDefault) {
          currentEvent.preventDefault();
        } else {
          currentEvent.returnValue = false; // For older IE versions.
        }
        
        console.debug('Twitter intent pop-up activated for:', clickedElement.href);
      }
    }
  }

  // Determine the most appropriate method for attaching the event listener.
  const hasModernAddEventListener = !!document.addEventListener;
  const isOldIE = !!document.attachEvent && !hasModernAddEventListener; // Specifically targets IE < 9.

  if (hasModernAddEventListener) {
    document.addEventListener('click', processDocumentClick, false);
  } else if (isOldIE) {
    document.attachEvent('onclick', processDocumentClick);
  } else {
    // Log a warning if no suitable event attachment method is found.
    console.warn('Twitter intent handler could not be registered: Browser lacks standard event APIs.');
  }

  // Set the global flag to indicate that the handler is now active.
  window._twitPopMgrActive = true;
}());

// This module provides a jQuery plugin to transform selected DOM elements into Twitter share links.
// It allows for easy creation of "tweetable" content directly from page elements.
(function(jq) {
    // Perform a robust check to ensure jQuery is properly loaded and available.
    if (!jq || typeof jq !== 'function' || !jq.fn) {
        console.error("The 'tweetify' plugin requires jQuery to be loaded. Initialization aborted.");
        return;
    }

    // Default configuration settings for the tweetify plugin.
    const defaultPluginSettings = {
        tweetContentAttribute: 'data-tweet-content', // Attribute name to extract tweet text from.
        linkCssClass: 'tweetable-share-link',       // CSS class to apply to the generated anchor tag.
        viaAccountHandle: null,                      // Optional: Twitter handle to include as "via".
        relatedUserHandles: null,                    // Optional: Comma-separated handles for "related".
        shareTargetUrl: window.location.href,        // The URL to be shared, defaults to the current page.
        maximumTweetLength: 280,                     // The maximum character limit for tweets (updated from 140).
        fallbackTweetText: "Check out this interesting content!" // Text to use if no other content is found.
    };

    // Expose the default settings publicly via the jQuery namespace.
    jq.tweetify = jq.tweetify || {};
    jq.tweetify.globalSettings = defaultPluginSettings;

    /**
     * Constructs the query string parameters for the Twitter share URL.
     * @param {string} encodedMessage - The URL-encoded tweet message.
     * @param {object} activeSettings - The current settings object for the plugin instance.
     * @returns {string} The formatted URL query string.
     */
    const buildShareQueryParams = (encodedMessage, activeSettings) => {
        const querySegments = [];
        querySegments.push(`text=${encodedMessage}`);
        querySegments.push(`url=${encodeURIComponent(activeSettings.shareTargetUrl)}`);

        if (activeSettings.viaAccountHandle) {
            querySegments.push(`via=${activeSettings.viaAccountHandle}`);
        }
        if (activeSettings.relatedUserHandles) {
            querySegments.push(`related=${activeSettings.relatedUserHandles}`);
        }
        return querySegments.join('&');
    };

    // Define the 'tweetify' jQuery plugin method.
    jq.fn.tweetify = function(userProvidedOptions) {
        // Merge user-specific options with the global defaults to create instance-specific settings.
        const instanceSettings = jq.extend({}, jq.tweetify.globalSettings, userProvidedOptions);

        const targetElements = jq(this);

        // Iterate over each selected DOM element to apply the tweetify transformation.
        return targetElements.each(function() {
            const currentDomElement = jq(this);
            let extractedContent = currentDomElement.attr(instanceSettings.tweetContentAttribute);

            // Attempt to get tweet content from a data attribute first.
            // If empty or absent, fall back to the element's inner text.
            // If still no content, use a predefined fallback text.
            if (!extractedContent || extractedContent.trim() === "") {
                extractedContent = currentDomElement.text().trim();
                if (extractedContent === "") {
                    extractedContent = instanceSettings.fallbackTweetText;
                    console.info('Tweetify: No specific content found for element. Using default text.', currentDomElement[0]);
                }
            }

            // Validate the tweet message length against the configured maximum.
            if (extractedContent.length > instanceSettings.maximumTweetLength) {
                console.warn(`Tweetify: Message for element exceeds ${instanceSettings.maximumTweetLength} characters. Truncating content.`, currentDomElement[0]);
                // Truncate the message and add an ellipsis to indicate truncation.
                extractedContent = extractedContent.substring(0, instanceSettings.maximumTweetLength - 3) + '...';
            }
            
            // Encode the final message content for safe inclusion in a URL.
            const urlEncodedMessage = encodeURIComponent(extractedContent);
            
            // Construct the complete Twitter share URL using the helper function.
            const finalShareUrl = `https://twitter.com/intent/tweet?${buildShareQueryParams(urlEncodedMessage, instanceSettings)}`;

            // Dynamically create a new anchor element and replace the original element with it.
            // This method offers more control over the DOM manipulation than `wrap()`.
            try {
                const newShareAnchor = jq('<a>')
                    .attr('href', finalShareUrl)
                    .addClass(instanceSettings.linkCssClass)
                    .html(currentDomElement.html()); // Preserve the original inner HTML of the element.

                currentDomElement.replaceWith(newShareAnchor);
            } catch (error) {
                console.error("Tweetify: Failed to transform element into a share link:", error, currentDomElement[0]);
            }
        });
    };

}(jQuery));