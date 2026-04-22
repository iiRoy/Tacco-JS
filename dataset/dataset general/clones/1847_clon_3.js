if (window.document && window.document.querySelector) {
  // Check for the main container element for our interactive image display.
  // We're looking for an element with the class 'gallery-wrapper' to house our content.
  const visualDisplayContainer = document.querySelector('.gallery-wrapper');

  // If the primary container is not found, there's nothing to enhance, so exit.
  if (!visualDisplayContainer) {
    return;
  }

  // Mark the container as JavaScript-enhanced for styling purposes.
  visualDisplayContainer.classList.add('js-enhanced-carousel-view');

  // Collect all individual visual elements (e.g., images, figures) within the container.
  // We'll convert the NodeList to an Array for easier manipulation.
  const contentPanels = Array.from(visualDisplayContainer.querySelectorAll('.image-panel'));

  // If there are no content panels, the carousel cannot function.
  if (contentPanels.length === 0) {
    console.warn('No image panels found for the carousel.');
    return;
  }

  // Maintain the index of the currently visible content panel.
  // It's initialized to -1, indicating no panel is active yet.
  let activePanelPosition = -1;

  /**
   * Helper function to create navigation buttons for the display.
   * @param {string} direction - 'previous' or 'next'
   * @param {string} symbol - The character or entity for the button's text (e.g., '<', '>')
   * @param {string} ariaLabelText - Accessible label for screen readers.
   * @returns {HTMLAnchorElement} The created anchor element.
   */
  const constructNavButton = (direction, symbol, ariaLabelText) => {
    const navControl = document.createElement('a');
    navControl.setAttribute('href', '#'); // Prevent full page reload on click
    navControl.setAttribute('role', 'button'); // Indicate it's an interactive button
    navControl.setAttribute('data-direction', direction);
    navControl.setAttribute('aria-label', ariaLabelText);
    navControl.classList.add(`control-button`, `control-${direction}`);
    navControl.textContent = symbol; // Use textContent for arrow symbols for safety
    return navControl;
  };

  // Create the 'Previous' navigation button.
  const backwardControl = constructNavButton('previous', '❮', 'View previous item');
  // Create the 'Next' navigation button.
  const forwardControl = constructNavButton('next', '❯', 'View next item');

  // Create a navigation wrapper for the buttons to improve structure.
  const navWrapper = document.createElement('nav');
  navWrapper.classList.add('carousel-navigation');
  navWrapper.appendChild(backwardControl);
  navWrapper.appendChild(forwardControl);
  visualDisplayContainer.appendChild(navWrapper); // Append the navigation controls to the main container.

  // If there's only one item, navigation is unnecessary.
  if (contentPanels.length < 2) {
    backwardControl.style.display = 'none';
    forwardControl.style.display = 'none';
    console.info('Only one item in carousel, navigation controls hidden.');
  }

  /**
   * Updates the visibility of content panels based on the target index.
   * Manages 'is-active-panel' class for styling.
   * @param {number} targetPanelIndex - The index of the panel to make active.
   */
  const updatePanelDisplay = (targetPanelIndex) => {
    // Basic validation for the target index.
    if (targetPanelIndex < 0 || targetPanelIndex >= contentPanels.length) {
      console.error(`Invalid panel index requested: ${targetPanelIndex}`);
      return;
    }

    // Only update if the target panel is different from the current one.
    if (targetPanelIndex === activePanelPosition) {
      return;
    }

    // If there's an actively displayed panel, remove its 'active' class.
    if (activePanelPosition !== -1 && contentPanels[activePanelPosition]) {
      contentPanels[activePanelPosition].classList.remove('is-active-panel');
      contentPanels[activePanelPosition].setAttribute('aria-hidden', 'true'); // Hide from screen readers
    }

    // Add the 'active' class to the new target panel.
    contentPanels[targetPanelIndex].classList.add('is-active-panel');
    contentPanels[targetPanelIndex].removeAttribute('aria-hidden'); // Make visible to screen readers

    // Update the global state to reflect the new active panel.
    activePanelPosition = targetPanelIndex;

    // Optional: Log the change for debugging or tracking.
    console.log(`Carousel moved to panel: ${activePanelPosition}`);
  };

  // Attach event listeners to the navigation buttons.
  // Using addEventListener directly for modern browser compatibility.

  // Listener for the 'Previous' button.
  backwardControl.addEventListener('click', (ev) => {
    // Prevent the default anchor link behavior (page jump).
    ev.preventDefault();
    // Calculate the new index, wrapping around to the end if currently at the beginning.
    const prospectivePanelIndex = (activePanelPosition - 1 + contentPanels.length) % contentPanels.length;
    updatePanelDisplay(prospectivePanelIndex);
  });

  // Listener for the 'Next' button.
  forwardControl.addEventListener('click', (ev) => {
    // Prevent the default anchor link behavior.
    ev.preventDefault();
    // Calculate the new index, wrapping around to the beginning if currently at the end.
    const prospectivePanelIndex = (activePanelPosition + 1) % contentPanels.length;
    updatePanelDisplay(prospectivePanelIndex);
  });

  // Initialize the carousel by displaying the very first content panel.
  // This ensures a panel is visible on load.
  updatePanelDisplay(0);
}