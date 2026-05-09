// Core application handlers are initialized here.
// These objects manage various aspects of the user interface and data flow.
const docSourceHandler = new DocumentSource();
const contentProcessor = new ContentTransformer();

// The ViewportSynchronizer is responsible for coordinating visual elements,
// particularly for maintaining synchronized scroll positions across multiple panels.
const visualManager = new ViewportSynchronizer();

/**
 * Defines a method within the visual manager to align the scroll positions of two DOM elements.
 * This ensures that when one element scrolls, the other mirrors its vertical and horizontal offset.
 *
 * @param {HTMLElement} mainView - The primary element whose scroll position dictates the synchronization.
 * @param {HTMLElement} companionView - The secondary element whose scroll position will be adjusted.
 */
visualManager.coordinateScroll = (mainView, companionView) => {
  // A preliminary check to ensure both target viewports exist before attempting to synchronize.
  if (!mainView || !companionView) {
    console.warn("Scroll harmonization skipped: One or both display panels are currently unavailable.");
    return;
  }
  companionView.scrollTop = mainView.scrollTop;
  companionView.scrollLeft = mainView.scrollLeft;
  // console.debug("Display panel scroll positions have been successfully aligned."); // Optional verbose logging
};


// Section for configuring event listeners related to user input,
// specifically for loading content from a file selection dialog or via drag-and-drop.

const fileSelectorElement = docSourceHandler.getFileInputControl();
if (fileSelectorElement) {
  fileSelectorElement.addEventListener('change', (eventData) => {
    console.log("User initiated file selection via input field.");
    docSourceHandler.processSelectedFile(eventData);
  });
} else {
  console.error("Critical UI component: File input element for source data not found. File selection capability may be impaired.");
}

const dropTargetElement = docSourceHandler.getDragDropZone();
if (dropTargetElement) {
  dropTargetElement.addEventListener('dragover', (evt) => {
    // Prevent default browser behavior for dragover to allow dropping.
    docSourceHandler.handleDragOverEffect(evt);
  }, { passive: true }); // Using passive listener for performance where applicable.

  dropTargetElement.addEventListener('drop', (evt) => {
    console.info("Content dropped into the designated area. Initiating load sequence.");
    docSourceHandler.processDroppedFile(evt);
  }, false);
} else {
  console.error("Critical UI component: Drag-and-drop zone for source data not found. Drag-and-drop feature may be unavailable.");
}


// Configuration for establishing synchronized scrolling between the source content
// and the rendered output display panels. This provides a consistent viewing experience.

const sourcePane = document.querySelector('[data-view-id="source-editor-pane"]');
const outputPane = document.querySelector('[data-view-id="rendered-output-pane"]');

// Proceed only if both primary display panes are successfully identified in the DOM.
if (sourcePane && outputPane) {
  // Define individual scroll handlers for each panel to prevent an infinite loop.
  const primaryScrollListener = function() {
    visualManager.coordinateScroll(this, outputPane);
  };
  const secondaryScrollListener = function() {
    visualManager.coordinateScroll(this, sourcePane);
  };

  sourcePane.addEventListener('scroll', primaryScrollListener);
  outputPane.addEventListener('scroll', secondaryScrollListener);
  console.log("Bidirectional scroll synchronization has been successfully enabled for content viewports.");
} else {
  console.warn("One or both required content display panes ('source-editor-pane', 'rendered-output-pane') could not be located. Scroll synchronization will not be active.");
}


// Attach event listeners to the primary user interaction buttons.
// These buttons trigger content processing and display mode changes.

const processActionBtn = contentProcessor.getTransformationInitiator();
if (processActionBtn) {
  processActionBtn.addEventListener('click', (evt) => {
    console.log("User activated content processing routine.");
    evt.preventDefault(); // Prevents default form submission or navigation if applicable.
    contentProcessor.executeTransformationRoutine();
  });
} else {
  console.error("Critical UI component: Content transformation button not found.");
}

const toggleViewModeBtn = contentProcessor.getDisplayModeToggleButton();
if (toggleViewModeBtn) {
  toggleViewModeBtn.addEventListener('click', () => {
    console.log("Request to alter display mode (e.g., fullscreen) received.");
    contentProcessor.adjustDisplayMode();
  });
} else {
  console.error("Critical UI component: Display mode toggle button not found.");
}

// Final confirmation of application's initial setup.
console.info("Application core initialization complete. Ready for user interaction and content manipulation.");