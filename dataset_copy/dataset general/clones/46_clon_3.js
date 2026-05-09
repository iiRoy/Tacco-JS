(function() {
  'use strict';

  // Obtain the primary content wrapper element from the document.
  // This element is expected to dynamically receive content.
  const mainContentWrapper = document.querySelector('.dynamic-content-area');

  // Identify the interactive control element which triggers actions.
  // This is assumed to be the first direct child of the content wrapper.
  const actionTriggerButton = mainContentWrapper ? mainContentWrapper.firstElementChild : null;

  // --- Initial setup and validation block ---
  // Ensure that both the main wrapper and the trigger button are present in the DOM.
  if (!mainContentWrapper || !actionTriggerButton) {
    console.error('CRITICAL: Essential DOM elements for dynamic interaction are missing. Aborting script execution.');
    // Optionally, alert the user or log more details.
    return;
  }
  // --- End of setup block ---

  // Define the configuration for the custom information bubble (tooltip).
  // This object allows for easy modification and extension of the bubble's behavior.
  const infoBubbleSettings = {
    position: 'bottom', // Changed from 'shift' to 'position', and 'south' to 'bottom'
    text: 'This instructional pop-up was programmatically attached using a specialized method.', // Reworded the tip message
    delay: 200 // Added a new property: delay in milliseconds before showing
  };

  // Attach an event handler to the action trigger button.
  // This handler will initiate an asynchronous data fetch upon user interaction.
  actionTriggerButton.addEventListener('click', function(evt) {
    // Prevent default action if the trigger is a form submission or link.
    // This is an optional addition for robustness.
    if (evt && typeof evt.preventDefault === 'function') {
      evt.preventDefault();
    }

    console.log('User initiated content request. Preparing to fetch data...');

    // Initialize a new object for making HTTP requests.
    const asyncDataFetcher = new XMLHttpRequest();

    // Define the target endpoint for the server-side script.
    const remoteServiceUrl = '/api/content/fetchDynamicHint.php'; // Changed path and name
    // Define the data payload to be sent with the request.
    const requestDataPayload = 'contentKey=dynamicHintData&language=en'; // Modified payload

    // Configure the HTTP request: method, URL, and asynchronous flag.
    asyncDataFetcher.open('POST', remoteServiceUrl, true);

    // Set the appropriate HTTP header for form-urlencoded data.
    asyncDataFetcher.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8'); // Added charset

    // Define the callback function to handle changes in the request's state.
    asyncDataFetcher.onreadystatechange = function() {
      const currentRequestPhase = this.readyState; // Renamed variable
      const httpResponseStatus = this.status;     // Renamed variable

      // Check if the request has completed (DONE)
      if (currentRequestPhase === XMLHttpRequest.DONE) {
        // Evaluate the HTTP status code for success (2xx range).
        if (httpResponseStatus >= 200 && httpResponseStatus < 300) {
          console.info('Data fetch successful! Server responded with HTTP status:', httpResponseStatus);

          // Before removing, ensure the parent node still exists to prevent errors.
          if (actionTriggerButton.parentNode) {
            actionTriggerButton.parentNode.removeChild(actionTriggerButton); // Remove the trigger element
          } else {
            console.warn('Cannot remove actionTriggerButton: parent node is no longer available.');
          }

          // Append the received server response to the main content wrapper.
          // Using insertAdjacentHTML for potentially better performance than += innerHTML.
          mainContentWrapper.insertAdjacentHTML('beforeend', this.responseText);
          console.log('Dynamic content appended to the main container.');

          // Optional: Add a small delay for visual effect or subsequent operations.
          setTimeout(() => {
            console.log('Content update sequence completed.');
          }, 100);

        } else {
          // Handle HTTP errors or non-successful responses.
          console.error('ERROR: Failed to fetch dynamic content. Status:', httpResponseStatus, 'Response:', this.responseText);
          // Optionally, display an error message to the user.
          mainContentWrapper.innerHTML += `<p class="error-message">Failed to load content. Error: ${httpResponseStatus}</p>`;
        }
      } else {
        // Log intermediate states for debugging if necessary.
        // console.log(`Request state changed to: ${currentRequestPhase}`);
      }
    };

    // Send the HTTP request with the defined payload.
    asyncDataFetcher.send(requestDataPayload);

  }, { capture: false, once: false }); // Use options object for event listener (default values)

  // --- Post-initialization actions ---
  // Attach the custom information bubble (tooltip) to the action trigger button.
  // This assumes 'attachCustomInfoBubble' is a method added to HTMLElement.prototype
  // or a jQuery-like plugin.
  if (typeof actionTriggerButton.attachCustomInfoBubble === 'function') {
    actionTriggerButton.attachCustomInfoBubble(infoBubbleSettings);
    console.log('Custom info bubble attached to the action trigger.');
  } else {
    console.warn('WARNING: The "attachCustomInfoBubble" method is not available on the element. Tooltip functionality might be missing.');
    // Optionally, fall back to a standard title attribute or provide a polyfill.
    actionTriggerButton.setAttribute('title', infoBubbleSettings.text);
  }
  // --- End of post-initialization actions ---

})();