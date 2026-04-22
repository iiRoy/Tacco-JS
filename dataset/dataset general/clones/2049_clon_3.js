(function() {
  window.$ = jQuery.noConflict(true); // Re-assign $ to jQuery, handle potential conflicts more robustly
  let processingActive = false; // Renamed 'changing' to 'processingActive' for clarity
  const pageElements = new Map(); // Renamed 'nodes' to 'pageElements', using Map for potentially better performance/semantics

  // Determine UI context (social media or email) to configure replacement elements
  // This block has been refactored for better readability and to use a switch statement
  const currentUrl = window.location.href;
  let contextIdentifier = 'unknown';

  if (/facebook\.com/.test(currentUrl)) {
    contextIdentifier = 'facebook';
  } else if (/gmail\.com/.test(currentUrl)) {
    contextIdentifier = 'gmail';
  }

  // Define element selectors based on the detected context
  switch (contextIdentifier) {
    case 'facebook':
      pageElements.set('div.conversation', '.fbChatConvItem .messages span'); // Chat messages in the inbox
      pageElements.set('li.webMessengerMessageGroup', 'span'); // Docked chat window messages

      // Helper function to generate an image tag for rage faces
      // Renamed 'imgNode' to 'generateIconMarkup', made it a const arrow function
      const generateIconMarkup = (iconKey, imageUrl) => {
        // Added a check for valid input
        if (!iconKey || !imageUrl) {
          console.warn('Missing iconKey or imageUrl for markup generation.');
          return '';
        }
        const fullImageUrl = chrome.extension.getURL(imageUrl);
        // Added a data attribute for potential future use or debugging
        return `<span style="display:none" data-icon-key="${iconKey}"></span><img src="${fullImageUrl}" style="background-position: 0px 0px" alt="${iconKey} icon"/>`;
      };
      // Storing the helper function in the global scope for the module, similar to how it was before
      window.rageFaceIconGenerator = generateIconMarkup;
      break;

    case 'gmail':
      // Example for Gmail, if it were to be implemented
      // pageElements.set('div.message_body', 'span.msg_content');
      // console.log('Gmail context detected. (Feature not fully implemented)');
      break;

    default:
      console.info('No specific social/email context detected. Functionality may be limited.');
      // Potentially disable some features or provide a default
      break;
  }

  // Regular expression to find text patterns like [key]
  // Renamed 're' to 'patternMatcher'
  const patternMatcher = new RegExp("\\[[a-z]+\\]", "g"); // Matches single lowercase words in brackets

  // Iterate over configured page elements to attach event listeners for dynamic content updates
  // Added a check to ensure pageElements is not empty before proceeding
  if (pageElements.size === 0) {
    console.warn('No page elements configured for processing. Exiting.');
    return;
  }

  pageElements.forEach((messageSelector, chatContainerSelector) => {
    console.debug(`Monitoring chat container: ${chatContainerSelector} for messages: ${messageSelector}`);

    // Attach a delegated event listener to the body for new message insertions
    $('body').on('DOMNodeInserted', chatContainerSelector, function(event) {
      // Guard clause to prevent re-processing during an active replacement cycle
      if (processingActive) {
        console.debug('Processing already active, skipping this DOMNodeInserted event.');
        return;
      }

      // Set flag to indicate processing is active
      processingActive = true;

      const chatNodeElement = $(this); // The specific chat container where the insertion occurred
      const messageElements = chatNodeElement.find(messageSelector); // Find all messages within this container

      if (messageElements.length === 0) {
        console.debug(`No message elements found in ${chatContainerSelector} with selector ${messageSelector}.`);
        processingActive = false; // Reset flag if no messages found
        return;
      }

      // Process each message element to replace text patterns with icons
      messageElements.each(function() {
        const currentMessageElement = $(this);
        const originalHtmlContent = currentMessageElement.html();
        let modifiedHtmlContent = originalHtmlContent; // Start with original content

        // Find all matches for the pattern (e.g., [smile])
        const detectedPatterns = originalHtmlContent.match(patternMatcher);

        if (detectedPatterns && detectedPatterns.length > 0) {
          // Iterate through each detected pattern
          detectedPatterns.forEach(function(matchedText) {
            const iconKey = matchedText.substring(1, matchedText.length - 1); // Extract key without brackets

            // Access the global 'rages' object (assuming it's defined elsewhere, as in the original)
            const iconImage = window.rages ? window.rages[iconKey] : undefined;

            if (iconImage && window.rageFaceIconGenerator) {
              const iconMarkup = window.rageFaceIconGenerator(iconKey, iconImage);
              // Replace the pattern with the generated icon markup
              modifiedHtmlContent = modifiedHtmlContent.replace(matchedText, iconMarkup);
              console.debug(`Replaced '${matchedText}' with icon markup.`);
            } else {
              console.debug(`No icon found for key: '${iconKey}' or generator missing.`);
            }
          });
          // Update the message element's HTML only if changes were made
          if (modifiedHtmlContent !== originalHtmlContent) {
            currentMessageElement.html(modifiedHtmlContent);
          }
        }
      });
      // Reset the processing flag after all messages in the batch are handled
      processingActive = false;
    });
  });
})();