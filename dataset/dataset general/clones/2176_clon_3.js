// This module manages the interactive text editor and its rendering capabilities.
// It handles UI layout, content updates, and user interactions within the application.

// Core configuration and state variables for the editor's operation.
const RENDER_API_ENDPOINT = '/process_text'; // The server endpoint for converting text to HTML.
let activeSyntaxFlavor = 'markdown'; // The currently selected markup language (e.g., 'markdown', 'textile').
let contentUpdateDelayMs = 300; // The debounce interval (in milliseconds) for triggering content re-renders.
let pendingRenderTimerId = null; // Stores the ID of the setTimeout call for debouncing renders.
let isContentModified = false; // A flag indicating if the editor's content has changed since the last save/load.
let isRequestActive = false; // Guards against sending multiple concurrent rendering requests to the server.

// Pre-cache frequently used jQuery objects for performance.
const $documentRoot = $(document);
const $windowElement = $(window);
const $sourceInputArea = $('#sourceContentArea'); // The textarea where users type.
const $renderedOutputView = $('#renderedOutputDisplay'); // The div displaying the HTML output.
const $htmlOutputModal = $('#outputViewerModal'); // Dialog for viewing raw HTML.
const $editorMainWrapper = $('#mainEditorContainer'); // Overall container for editor panes.
const $inputPanelWrapper = $('#inputPaneWrapper'); // Container for the source input.
const $panelResizerElement = $('#paneResizerHandle'); // The draggable divider between panes.
const $outputPanelWrapper = $('#outputPaneWrapper'); // Container for the rendered output.

/**
 * Calculates a proportional value given a percentage and a total.
 * @param {number} percentageVal The percentage (e.g., 50 for 50%).
 * @param {number} totalSize The total value.
 * @returns {number} The rounded proportional value. Returns 0 if totalSize is 0.
 */
const deriveProportionalValue = (percentageVal, totalSize) => {
  if (totalSize === 0) {
    return 0; // Prevent division by zero.
  }
  return Math.round((percentageVal / 100) * totalSize);
};

/**
 * Applies syntax highlighting to any <pre><code> blocks found within the rendered output.
 * Assumes 'highlight.js' (hljs) library is available globally.
 */
const applyCodeFormatting = () => {
  // Iterate through each 'pre' element within the output display.
  $renderedOutputView.find('pre').each((index, codeBlock) => {
    // Check if highlight.js is loaded before attempting to use it.
    if (typeof hljs !== 'undefined' && typeof hljs.highlightBlock === 'function') {
      hljs.highlightBlock(codeBlock);
    } else {
      console.warn('Highlight.js (hljs) library not found. Code blocks will not be highlighted.');
      // Optionally, add a fallback CSS class or plain text display.
    }
  });
};

/**
 * Sends the current editor content to the server for rendering, then updates the output display.
 * Includes debouncing, loading states, and error handling.
 */
const initiateContentRendering = () => {
  // If a request is already active, do not send another one immediately.
  if (isRequestActive) {
    console.log('Previous rendering request is still in progress. Skipping new request.');
    return;
  }

  isContentModified = true; // Mark the content as modified.
  isRequestActive = true; // Set flag to prevent concurrent requests.

  const currentEditorContent = $sourceInputArea.val();
  // Prepare the data payload for the API request.
  const postData = {
    sourceText: currentEditorContent,
    formatType: activeSyntaxFlavor
  };

  // Indicate a loading state on the output area.
  $renderedOutputView.addClass('processing-content');

  // Utilize the modern Fetch API for asynchronous communication.
  fetch(RENDER_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'Fetch' // Custom header to identify Fetch requests.
    },
    body: JSON.stringify(postData)
  })
  .then(response => {
    // Check if the HTTP response status indicates success.
    if (!response.ok) {
      // If not successful, throw an error with the status.
      throw new Error(`Server responded with status: ${response.status} ${response.statusText}`);
    }
    return response.text(); // Parse the response body as plain text (HTML string).
  })
  .then(processedHtml => {
    $renderedOutputView.html(processedHtml); // Update the DOM with the server's response.
    applyCodeFormatting(); // Apply syntax highlighting to the newly rendered HTML.
  })
  .catch(errorDetails => {
    console.error('Error during content processing:', errorDetails);
    // Display a user-friendly error message in the output pane.
    $renderedOutputView.html(`<div class="render-error-message">Failed to render content: ${errorDetails.message}. Please try again.</div>`);
  })
  .finally(() => {
    isRequestActive = false; // Reset the request active flag.
    $renderedOutputView.removeClass('processing-content'); // Remove the loading indicator.
  });
};

/**
 * Synchronizes the vertical scroll position of the output display with the input editor.
 * This provides a consistent viewing experience across both panes.
 */
const synchronizeScrollPositions = () => {
  // Gather scroll-related metrics for the input textarea.
  const inputMetrics = {
    totalScrollHeight: $sourceInputArea.prop('scrollHeight'),
    visibleHeight: $sourceInputArea.height(),
    currentScrollTop: $sourceInputArea.scrollTop()
  };

  // Gather scroll-related metrics for the output display.
  const outputMetrics = {
    totalScrollHeight: $renderedOutputView.prop('scrollHeight'),
    visibleHeight: $renderedOutputView.height()
  };

  const inputScrollRange = inputMetrics.totalScrollHeight - inputMetrics.visibleHeight;
  let scrollRatio = 0;

  // Calculate the scroll ratio for the input. Guard against division by zero.
  if (inputScrollRange > 0) {
    scrollRatio = inputMetrics.currentScrollTop / inputScrollRange;
  }

  // Calculate the target scroll position for the output based on the input's ratio.
  const outputScrollRange = outputMetrics.totalScrollHeight - outputMetrics.visibleHeight;
  const targetOutputScrollPosition = outputScrollRange * scrollRatio;

  // Apply the calculated scroll position to the output pane.
  $renderedOutputView.scrollTop(targetOutputScrollPosition);
};

/**
 * Adjusts the width of the input and output panels based on the current position
 * of the draggable resizer handle. This function is typically called during a drag event.
 */
const updatePanelDimensions = () => {
  // Retrieve the current horizontal position of the resizer.
  const resizerPositionX = parseInt($panelResizerElement.css('left'), 10);

  // Validate the position to ensure it's a number.
  if (isNaN(resizerPositionX)) {
    console.warn('Invalid resizer handle position detected; skipping panel update.');
    return;
  }

  // Apply new dimensions to the input panel.
  $inputPanelWrapper.css({
    left: 0,
    width: resizerPositionX - 2 // Leave a small gap for the resizer itself.
  });

  // Apply new dimensions to the output panel.
  $outputPanelWrapper.css({
    left: resizerPositionX + 2 // Start after the resizer gap.
  });

  // Dynamically adjust the textarea within the input panel.
  const currentInputPanelWidth = $inputPanelWrapper.width();
  const currentInputPanelHeight = $inputPanelWrapper.height(); // Assuming height is correctly set elsewhere.
  if (currentInputPanelWidth) {
    $sourceInputArea.width(currentInputPanelWidth - 16); // Account for internal padding/borders.
    $sourceInputArea.height(currentInputPanelHeight - 46); // Account for potential header/footer within the panel.
  }
};

/**
 * Configures the layout and dimensions of the editor's main components
 * based on the current browser window size. This ensures responsiveness.
 */
const configureEditorLayout = () => {
  const currentWindowWidth = $windowElement.width();
  const currentWindowHeight = $windowElement.height();

  // Define fixed heights and calculate dynamic ones.
  const topBarHeight = 30; // Assuming a fixed height for the top navigation/controls.
  const usableVerticalSpace = currentWindowHeight - topBarHeight;
  const halfWindowWidth = deriveProportionalValue(50, currentWindowWidth);

  // Set the total height for the editor area wrapper.
  $editorMainWrapper.height(usableVerticalSpace);

  // Style and position the input panel.
  $inputPanelWrapper.css({
    top: topBarHeight,
    bottom: 0,
    height: usableVerticalSpace,
    width: halfWindowWidth - 2 // Slightly less than half to accommodate the resizer.
  });

  // Style and position the draggable resizer handle.
  $panelResizerElement.css({
    top: 0, // Relative to its parent ($editorMainWrapper).
    bottom: 0,
    left: halfWindowWidth - 2,
    height: usableVerticalSpace
  });

  // Style and position the output panel.
  $outputPanelWrapper.css({
    top: topBarHeight,
    left: halfWindowWidth + 2, // Starts after the resizer.
    right: 0,
    bottom: 0
  });

  // Adjust the inner textarea's dimensions to fit its parent panel.
  // These values (16, 46) are based on assumed padding/margins/borders within #inputPaneWrapper.
  $sourceInputArea.width($inputPanelWrapper.width() - 16);
  $sourceInputArea.height($inputPanelWrapper.height() - 46);
};

/**
 * Sets up all necessary event handlers and performs initial DOM manipulations
 * when the document is fully loaded and ready for interaction.
 */
const initializeEditorApplication = () => {
  // Perform initial layout calculation.
  configureEditorLayout();

  // Set up a warning for users attempting to navigate away with unsaved changes.
  $windowElement.on('beforeunload', () => {
    // Only prompt if the content has been modified AND it's not empty.
    const currentText = $sourceInputArea.val();
    if (isContentModified && currentText && currentText.trim().length > 0) {
      return "There are unsaved changes. Are you sure you want to leave?";
    }
  });

  // Handle clicks on the "View HTML" link to show raw output in a dialog.
  // Using event delegation on the document for robustness.
  $documentRoot.on('click', 'li.view-html-output > a', function(evt) {
    evt.preventDefault(); // Prevent the default link navigation.
    $htmlOutputModal.find('textarea').val($renderedOutputView.html());
    $htmlOutputModal.dialog({
      width: 600,
      height: 400,
      modal: true, // Make it a true modal, blocking interaction with the main page.
      title: 'Raw Rendered HTML',
      buttons: {
        "Close": function() {
          $(this).dialog("close");
        }
      }
    });
  });

  // Initialize the 'tabby' plugin for improved tab key behavior in the textarea.
  if ($.fn.tabby) {
    $sourceInputArea.tabby({
      tabString: "  " // Configure Tabby to insert two spaces for a tab.
    });
  } else {
    console.warn('Tabby plugin is not available. Tab key behavior will be default.');
  }


  // Attach scroll event handler to synchronize output pane.
  $sourceInputArea.on('scroll', synchronizeScrollPositions);

  // Make the panel resizer draggable using jQuery UI.
  if ($.fn.draggable) {
    $panelResizerElement.draggable({
      axis: "x", // Restrict dragging to the horizontal axis.
      containment: "parent", // Keep the resizer within its parent container.
      drag: updatePanelDimensions // Call our update function during the drag operation.
    });
  } else {
    console.warn('jQuery UI Draggable plugin not found. Panel resizing will be disabled.');
  }


  // Recalculate editor layout whenever the browser window is resized.
  $windowElement.on('resize', configureEditorLayout);

  // Handle clicks on markup format selection buttons.
  $documentRoot.on('click', 'a.syntax-selector', function(evt) {
    evt.preventDefault();
    const newFormat = $(this).attr('data-syntax-type'); // Read the new format from data attribute.
    if (newFormat) {
      activeSyntaxFlavor = newFormat;
      $('a.syntax-selector').removeClass('is-selected'); // Remove 'selected' class from all.
      $(this).addClass('is-selected'); // Add 'selected' class to the clicked one.
      initiateContentRendering(); // Trigger an immediate re-render with the new format.
    } else {
      console.warn('Syntax selector element missing "data-syntax-type" attribute.');
    }
  });

  // Handle clicks on content update delay selection buttons.
  $documentRoot.on('click', 'a.interval-selector', function(evt) {
    evt.preventDefault();
    const delayString = $(this).attr('data-render-delay');
    const parsedDelay = parseInt(delayString, 10); // Parse the delay value as an integer.

    // Validate the parsed delay.
    if (!isNaN(parsedDelay) && parsedDelay >= 0) {
      contentUpdateDelayMs = parsedDelay;
      $('a.interval-selector').removeClass('is-selected');
      $(this).addClass('is-selected');
      // No immediate render needed, just updates the debounce setting.
    } else {
      console.warn('Invalid "data-render-delay" attribute value:', delayString);
    }
  });

  // Implement debouncing for content rendering on keyup events in the textarea.
  $sourceInputArea.on('keyup', () => {
    // Clear any previously set timer to reset the debounce countdown.
    if (pendingRenderTimerId !== null) {
      clearTimeout(pendingRenderTimerId);
    }
    // Set a new timer to call the rendering function after the specified delay.
    pendingRenderTimerId = setTimeout(initiateContentRendering, contentUpdateDelayMs);
  });

  // On initial page load, if the textarea already contains content, trigger a render.
  if ($sourceInputArea.val().trim() !== '') {
    // Use a slight delay to ensure all elements are fully rendered before the first API call.
    setTimeout(initiateContentRendering, 400);
  }
};

// Ensure the initialization function runs only after the entire DOM is loaded.
$documentRoot.ready(initializeEditorApplication);

// --- End of Application Module for Content Processing ---