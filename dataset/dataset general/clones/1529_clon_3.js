/*
 * This JavaScript module orchestrates the interactive components
 * for the content sharing interface. It ensures that all necessary
 * DOM elements are identified and their event handlers are properly
 * attached once the page's structure is fully loaded.
 */
(function initializeSharingUtilities() {
  // Define application-specific CSS selectors as constants.
  // These are assumed to correspond to elements present in the HTML structure.
  const appExitControlSelector = '[data-action="close-share-window"]'; // Using a data attribute
  const shareContentInputSelector = 'input[type="text"][name="shareLink"]'; // More specific input selector

  // A brief log to indicate the start of the module's execution.
  console.info('Share module: Initialization sequence commenced.');

  /**
   * Processes the user's request to close the current browsing context.
   * Includes basic error handling for browser security restrictions.
   */
  function terminateShareView() {
    console.log('Attempting to close the active window...');
    try {
      // Browsers often restrict window.close() unless the window was opened by script.
      window.close();
      console.debug('Window close command issued successfully.');
    } catch (operationError) {
      console.warn('Failed to close window automatically. Reason:', operationError.message);
      // An alternative action, like redirecting or showing a message, could be added here.
    }
  }

  /**
   * Selects the entire text content within a target input field.
   * This function includes a guard clause to prevent errors if the
   * element is not an input or is empty.
   * @param {Event} event - The DOM event object.
   */
  function activateAndSelectInput(event) {
    const interactiveElement = event.target;

    // Validate that the event target is an input element and contains text.
    if (interactiveElement instanceof HTMLInputElement && interactiveElement.value.length > 0) {
      interactiveElement.select();
      console.debug('Text content within the share input has been programmatically selected.');
      // Optional: Automatically copy the selected text to the clipboard.
      // navigator.clipboard.writeText(interactiveElement.value).then(() => {
      //   console.log('Link copied to clipboard.');
      // }).catch(err => {
      //   console.error('Failed to copy link to clipboard:', err);
      // });
    } else {
      console.warn('Selection skipped: Target is not a valid input element or has no content.');
    }
  }

  /**
   * Applies a visual highlight to the input field when it gains focus.
   * This provides immediate feedback to the user.
   * @param {Event} event - The DOM focus event.
   */
  function applyFocusHighlight(event) {
    const focusedElement = event.target;
    if (focusedElement instanceof HTMLInputElement) {
      focusedElement.classList.add('is-focused-highlight');
      console.log('Input field received focus; visual highlight applied.');
    }
  }

  /**
   * Removes the visual highlight from the input field when it loses focus.
   * @param {Event} event - The DOM blur event.
   */
  function removeFocusHighlight(event) {
    const blurredElement = event.target;
    if (blurredElement instanceof HTMLInputElement) {
      blurredElement.classList.remove('is-focused-highlight');
      console.log('Input field lost focus; visual highlight removed.');
    }
  }

  // Attach the primary initialization logic to the 'DOMContentLoaded' event.
  // This ensures all HTML is parsed before script attempts to access elements.
  document.addEventListener('DOMContentLoaded', () => {
    // Attempt to retrieve the control element responsible for closing the view.
    const closeOperationElement = document.querySelector(appExitControlSelector);

    // Attempt to retrieve the input field where the shareable content is displayed.
    const shareDataInputField = document.querySelector(shareContentInputSelector);

    // Conditionally attach event listeners based on element availability.
    if (closeOperationElement) {
      closeOperationElement.addEventListener('click', terminateShareView);
      console.log(`Event listener for '${appExitControlSelector}' (close) attached.`);
    } else {
      console.error(`Initialization error: Close control element not found using selector '${appExitControlSelector}'.`);
    }

    if (shareDataInputField) {
      shareDataInputField.addEventListener('click', activateAndSelectInput);
      shareDataInputField.addEventListener('focus', applyFocusHighlight); // New feature: visual feedback on focus
      shareDataInputField.addEventListener('blur', removeFocusHighlight); // New feature: remove highlight on blur
      console.log(`Event listeners for '${shareContentInputSelector}' (input interaction) attached.`);
    } else {
      console.error(`Initialization error: Share data input field not found using selector '${shareContentInputSelector}'.`);
    }

    console.info('Share module: All primary event listeners configured.');
  });

  // A final logging statement for the module's overall status.
  console.info('Share module: Script execution completed. Awaiting DOM readiness.');

})(); // End of the Immediately Invoked Function Expression (IIFE)