const presentationSettings = (function() {
  // Internal state management for various UI interactions.
  // This helps centralize state and avoid scattered global variables.
  const _interfaceState = {
    isSidebarTransitioning: false, // Tracks if the sidebar is currently animating
    titleUpdateDebounceId: null,   // Timer ID for debouncing title updates
    sidebarAnimationDurationMs: 400, // Duration for sidebar slide animation
    titleDebounceDelayMs: 350,       // Delay for title update debounce
    activeStyleSheetId: null       // Stores the ID of the currently active stylesheet
  };

  // Helper function to safely get the head element
  function getDocumentHead() {
    return document.head || document.querySelector('head');
  }

  // --- Style Management Functions ---

  /**
   * Injects a new stylesheet link into the document head.
   * @param {string} styleIdentifier - The name of the theme/stylesheet to apply (e.g., 'default', 'night').
   */
  function applyPresentationTheme(styleIdentifier) {
    if (!styleIdentifier || styleIdentifier.trim() === '') {
      console.warn("Attempted to apply an empty or invalid theme identifier.");
      return;
    }

    const availableThemes = [
      'default.css', 'night.css', 'beige.css', 'dark.css' // Added an extra theme
    ];

    // Ensure the requested theme is one of the allowed ones
    const fullStylePath = 'css/' + styleIdentifier.toLowerCase() + '.css';
    if (!availableThemes.includes(fullStylePath)) {
      console.error(`Theme "${styleIdentifier}" is not recognized or allowed.`);
      return;
    }

    // Remove any previously applied presentation stylesheets
    removeOldPresentationStyles();

    // Create and append the new stylesheet link
    const newStyleLink = document.createElement('link');
    newStyleLink.rel = 'stylesheet';
    newStyleLink.href = fullStylePath;
    newStyleLink.setAttribute('data-presentation-theme', styleIdentifier); // Custom attribute for easier identification
    newStyleLink.setAttribute('aria-label', `Presentation Theme: ${styleIdentifier}`); // Accessibility improvement

    const headElement = getDocumentHead();
    if (headElement) {
      headElement.appendChild(newStyleLink);
      _interfaceState.activeStyleSheetId = styleIdentifier; // Update state
      if (typeof App !== 'undefined' && App.updateCurrentTheme) { // Assuming App might have an update method
        App.updateCurrentTheme(styleIdentifier);
      } else if (typeof App !== 'undefined') {
        App.currentVisualMode = styleIdentifier; // Fallback to direct property
      }
    } else {
      console.error("Could not find document head to apply stylesheet.");
    }
  }

  /**
   * Removes all stylesheets previously added by this module, identified by a data attribute.
   */
  function removeOldPresentationStyles() {
    const existingThemeLinks = document.querySelectorAll('link[data-presentation-theme]');
    if (existingThemeLinks.length === 0) {
      // console.log("No existing presentation theme links found to remove.");
      return;
    }

    existingThemeLinks.forEach(linkElement => {
      if (linkElement && linkElement.parentNode) {
        linkElement.parentNode.removeChild(linkElement);
      }
    });
    _interfaceState.activeStyleSheetId = null; // Clear state
  }


  // --- Sidebar Interaction Functions ---

  /**
   * Collapses the sidebar panel, applying a CSS class for transformation.
   * @param {HTMLElement} sidebarPanelElement - The DOM element representing the sidebar.
   */
  function collapseSidebarPanel(sidebarPanelElement) {
    if (!sidebarPanelElement || !sidebarPanelElement.classList) {
      console.error("Invalid sidebar panel element provided for collapsing.");
      return;
    }
    // Prevent re-triggering if already transitioning or collapsed
    if (_interfaceState.isSidebarTransitioning || sidebarPanelElement.classList.contains('collapsed-view')) {
      return;
    }

    sidebarPanelElement.classList.add('collapsed-view'); // Assumes CSS handles the transition
    _interfaceState.isSidebarTransitioning = true;

    // Reset transition flag after animation duration
    window.setTimeout(() => {
      _interfaceState.isSidebarTransitioning = false;
    }, _interfaceState.sidebarAnimationDurationMs);
  }

  /**
   * Expands the sidebar panel, removing the CSS class that collapses it.
   * @param {HTMLElement} sidebarPanelElement - The DOM element representing the sidebar.
   */
  function expandSidebarPanel(sidebarPanelElement) {
    if (!sidebarPanelElement || !sidebarPanelElement.classList) {
      console.error("Invalid sidebar panel element provided for expanding.");
      return;
    }
    // Prevent re-triggering if already transitioning or expanded
    if (_interfaceState.isSidebarTransitioning || !sidebarPanelElement.classList.contains('collapsed-view')) {
      return;
    }

    sidebarPanelElement.classList.remove('collapsed-view'); // Assumes CSS handles the transition
    _interfaceState.isSidebarTransitioning = true;

    // Reset transition flag after animation duration
    window.setTimeout(() => {
      _interfaceState.isSidebarTransitioning = false;
    }, _interfaceState.sidebarAnimationDurationMs);
  }


  // --- Presentation Title Update Function ---

  /**
   * Updates the document title and application's presentation title with a debounce mechanism.
   * @param {HTMLInputElement} titleInputElement - The input element containing the new title.
   */
  function updatePresentationHeading(titleInputElement) {
    if (!titleInputElement || typeof titleInputElement.value === 'undefined') {
      console.error("Invalid title input element provided.");
      return;
    }

    const proposedTitle = titleInputElement.value.trim();

    // Clear any pending title update to prevent rapid updates
    if (_interfaceState.titleUpdateDebounceId) {
      clearTimeout(_interfaceState.titleUpdateDebounceId);
      _interfaceState.titleUpdateDebounceId = null;
    }

    // Set a new debounce timer
    _interfaceState.titleUpdateDebounceId = setTimeout(() => {
      if (proposedTitle.length === 0) {
        document.title = 'Untitled Presentation'; // Default title if input is empty
        if (typeof App !== 'undefined') App.presentationHeader = 'Untitled Presentation';
      } else if (proposedTitle.length < 3) { // Simple validation: minimum length
        // Optionally, show a temporary message to the user
        // console.warn("Presentation title is too short.");
        document.title = `[Short] ${proposedTitle}`;
        if (typeof App !== 'undefined') App.presentationHeader = `[Short] ${proposedTitle}`;
      } else {
        document.title = proposedTitle;
        if (typeof App !== 'undefined') App.presentationHeader = proposedTitle;
      }
      _interfaceState.titleUpdateDebounceId = null; // Clear timer ID after execution
    }, _interfaceState.titleDebounceDelayMs);
  }


  // --- Module Export / Initialization ---

  return {
    /**
     * Initializes all necessary event listeners for the presentation UI.
     * @param {object} uiElements - An object containing references to key DOM elements.
     * @param {HTMLElement} uiElements.titleInput - Input field for the presentation title.
     * @param {HTMLSelectElement} uiElements.themeSelector - Dropdown for selecting themes.
     * @param {HTMLButtonElement} uiElements.hideSidebarButton - Button to hide the sidebar.
     * @param {HTMLElement} uiElements.sidebarContainer - The main container element for the sidebar.
     */
    setupInteractionHandlers: function(uiElements) {
      if (!uiElements || !uiElements.titleInput || !uiElements.themeSelector || !uiElements.hideSidebarButton || !uiElements.sidebarContainer) {
        console.error("Missing required UI element references for setupInteractionHandlers.");
        return;
      }

      // Define all event listener configurations in an array for cleaner setup
      const listenerConfigs = [
        {
          element: uiElements.titleInput,
          eventType: 'keyup',
          handler: function() { updatePresentationHeading(this); },
          useCapture: false
        },
        {
          element: uiElements.themeSelector,
          eventType: 'change',
          handler: function() { applyPresentationTheme(this.value); },
          useCapture: false
        },
        {
          element: uiElements.hideSidebarButton,
          eventType: 'click',
          handler: function() { collapseSidebarPanel(uiElements.sidebarContainer); },
          useCapture: false
        },
        {
          element: uiElements.sidebarContainer, // Listen on the container itself for hover
          eventType: 'mouseover',
          handler: function() { expandSidebarPanel(this); },
          useCapture: false
        }
      ];

      // Iterate and attach listeners
      listenerConfigs.forEach(config => {
        if (config.element && typeof config.element.addEventListener === 'function') {
          config.element.addEventListener(config.eventType, config.handler, config.useCapture);
        } else {
          console.warn(`Could not attach ${config.eventType} listener to element. Element might be null or invalid.`, config.element);
        }
      });

      // Initialize with the default theme if App.currentVisualMode exists
      if (typeof App !== 'undefined' && App.currentVisualMode && !this.activeStyleSheetId) {
        applyPresentationTheme(App.currentVisualMode);
      }
    }
  };
})();

// Export the module for external consumption
module.exports = presentationSettings;