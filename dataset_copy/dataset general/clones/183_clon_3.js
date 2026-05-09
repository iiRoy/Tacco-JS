// Ensure primary dependencies, jQuery and CodeMirror, are loaded before attempting initialization.
// If either is missing, log an error and halt execution to prevent runtime issues.
if (typeof jQuery === 'undefined' || typeof CodeMirror === 'undefined') {
  console.error('Critical dependencies (jQuery or CodeMirror) were not found. Application startup aborted.');
  // In a production environment, one might display a user-friendly message or attempt to load missing scripts.
} else {
  // Execute the main application setup logic once the DOM is fully loaded and ready for manipulation.
  jQuery(document).ready(function () {
    // Configure the primary UI layout manager for the application's main container.
    // This establishes a flexible panel system for organizing content.
    jQuery('#mainLayoutContainer').layout({
      livePaneResizing: true, // Enable visual feedback during pane resizing.
      stateManagement__enabled: true, // Allow the layout state to be saved and restored.
      enableCursorHotkey: false, // Deactivate keyboard shortcuts tied to cursor position for layout.
      east__size: 550, // Assign a fixed width of 550 pixels to the eastern panel.
      north__resizable: false, // Prevent users from resizing the northern panel.
      north__closable: false, // Disable the close button for the northern panel.
      // Removed non-functional 'paneClass' and 'resizerClass' definitions for non-existent elements.
      south__resizable: false, // Prevent users from resizing the southern panel.
      south__closable: false   // Disable the close button for the southern panel.
    });

    // Define the ID of the HTML textarea element that CodeMirror will transform.
    const sourceEditorTargetId = "haskellSourceInput";
    const sourceTextAreaElement = document.getElementById(sourceEditorTargetId);

    // Implement a guard clause to ensure the target element for the editor exists.
    // If not found, log an error and prevent further editor-related initialization.
    if (!sourceTextAreaElement) {
      console.error(`Editor target element #${sourceEditorTargetId} could not be located in the DOM.`);
      return; // Exit the initialization block gracefully.
    }

    // Assemble the comprehensive configuration object for the CodeMirror editor instance.
    const codeMirrorSettings = {
      mode: "haskell", // Set the syntax highlighting mode to Haskell.
      lineNumbers: true, // Display line numbers in the editor gutter.
      matchBrackets: true, // Automatically highlight matching bracket pairs.
      autofocus: true, // Give focus to the editor when the page loads.
      autoClearEmptyLines: true, // Remove empty lines automatically on certain operations.
      indentUnit: 4, // Use 4 spaces as the standard indentation unit.
      gutters: ["cm-diagnostic-gutter"], // Add a custom gutter for displaying diagnostic icons.
      // Integrate code folding functionality, utilizing CodeMirror's built-in indentation-based range finder.
      onGutterClick: CodeMirror.newFoldFunction(CodeMirror.indentRangeFinder),
      // Define custom key bindings to enhance editor usability.
      extraKeys: {
        "Tab": function(activeEditor) {
          activeEditor.replaceSelection("    ", "end"); // Insert 4 spaces when Tab is pressed.
        },
        "Shift-Tab": "indentLess" // Decrease indentation level on Shift-Tab.
      }
    };

    // Instantiate the CodeMirror editor, converting the textarea into an advanced code editor.
    applicationCoreState.codeEditorInstance = CodeMirror.fromTextArea(sourceTextAreaElement, codeMirrorSettings);

    // Attach an event listener to the editor for cursor activity.
    // This updates the visual highlight on the currently active line.
    applicationCoreState.codeEditorInstance.on("cursorActivity", function() {
      // If a line was previously highlighted, remove its highlight class.
      if (applicationCoreState.currentActiveLineHandle) {
        applicationCoreState.codeEditorInstance.removeLineClass(applicationCoreState.currentActiveLineHandle, "background", "cm-active-line-highlight");
      }
      // Determine the current line number where the cursor is located.
      const currentCursorLine = applicationCoreState.codeEditorInstance.getCursor().line;
      // Add the highlight class to the new active line and store its handle.
      applicationCoreState.currentActiveLineHandle = applicationCoreState.codeEditorInstance.addLineClass(
        currentCursorLine, "background", "cm-active-line-highlight");
    });

    // Register an event listener for any changes made to the editor's content.
    // This triggers the debounced code processing mechanism.
    applicationCoreState.codeEditorInstance.on("change", function (editorInstance, changeMetadata) {
      // Only queue processing if the change originated from user input, not programmatically (e.g., setValue).
      if (changeMetadata.origin !== 'setValue') {
        applicationCoreState.queueCodeProcessing();
      }
    });

    // Apply an initial highlight to the very first line (line 0) upon editor initialization.
    applicationCoreState.currentActiveLineHandle = applicationCoreState.codeEditorInstance.addLineClass(0, "background", "cm-active-line-highlight");

    // Attach a click event handler to the 'Clear Editor' button.
    jQuery('#resetEditorContentButton').on('click', function() {
      applicationCoreState.codeEditorInstance.setValue(''); // Erase all content from the editor.
      applicationCoreState.clearAllIssueMarkers(); // Remove any existing diagnostic markers.
      jQuery('#analysisOutputDisplay').html(''); // Clear the results display area.
    });

    // Initiate an immediate code analysis submission after the editor is fully set up.
    applicationCoreState.initiateCodeAnalysis();
  });
}

// Centralized object to manage application-wide state and utility functions,
// promoting a cleaner global namespace and better organization.
const applicationCoreState = {
  // Configurable delay (in milliseconds) before submitting code for processing after user input.
  processingIntervalMs: 400,

  // References to key application components and timers.
  codeEditorInstance: null, // The active CodeMirror editor instance.
  submissionTimeoutId: null, // Identifier for the debounced submission timer.

  // Data structures for tracking and managing code diagnostics.
  errorLineNumbers: [], // A list of 0-based line numbers containing errors.
  errorTextMarkers: [], // An array of CodeMirror text marker objects for highlighted error tokens.
  currentActiveLineHandle: null, // The handle for the currently highlighted editor line.

  // Regular expression used to parse error messages from the backend response.
  // It specifically targets messages like "filename.idr:line:column:".
  issuePattern: /^.*\.idr:(\d+):(\d+):/gm,
  // The character displayed in the gutter to indicate an error on a line.
  errorGutterSymbol: '\u25cf', // A filled circle unicode character.

  // Flags to manage the state of server communication and request flow.
  serverCommunicationFailed: false, // True if a persistent server issue has been detected.
  isProcessingRequest: false, // True when an AJAX request is actively in progress.
  hasPendingRequest: false, // True if a new analysis request is queued to run after the current one finishes.

  /**
   * Schedules a debounced code analysis request. If a request is already
   * pending or scheduled, it resets the timer to wait for further user input.
   */
  queueCodeProcessing: function() {
    // If the server has previously indicated a critical failure, prevent new submissions.
    if (this.serverCommunicationFailed) {
      console.warn('Server communication failure detected. Skipping new code processing request.');
      return;
    }
    // Clear any previously set timeout to debounce the submission, ensuring only one runs after inactivity.
    if (this.submissionTimeoutId) {
      clearTimeout(this.submissionTimeoutId);
    }
    // Set a new timeout to execute the code analysis function after the specified delay.
    this.submissionTimeoutId = setTimeout(this.initiateCodeAnalysis.bind(this), this.processingIntervalMs);
  },

  /**
   * Dispatches an AJAX request to the backend with the current editor content for analysis.
   * This function ensures that only one request is active at a time; subsequent requests
   * are queued and executed sequentially.
   */
  initiateCodeAnalysis: function() {
    // If a request is already being processed, mark a new one as pending and return.
    if (this.isProcessingRequest) {
      this.hasPendingRequest = true;
      return;
    }

    // Set the flag to indicate that an AJAX request is now in progress.
    this.isProcessingRequest = true;

    // Execute the AJAX POST request using jQuery.
    jQuery.ajax({
      type: 'POST', // Use the HTTP POST method.
      url: '/sources/Foo.idr', // The endpoint URL for code analysis.
      data: this.codeEditorInstance.getValue(), // Send the current content of the CodeMirror editor.
      contentType: "text/x-haskell; charset=utf-8", // Specify the content type of the request payload.
      success: this.handleAnalysisResponse.bind(this), // Callback function for successful responses.
      error: this.handleAnalysisError.bind(this), // Callback function for AJAX errors.
      dataType: 'text' // Anticipate a plain text response from the server.
    })
    .always(() => { // This callback executes regardless of whether the AJAX call succeeded or failed.
      this.isProcessingRequest = false; // Clear the flag, as the request has completed.
      // If another request was queued while this one was active, trigger it now.
      if (this.hasPendingRequest) {
        this.hasPendingRequest = false; // Reset the queue flag.
        this.queueCodeProcessing(); // Immediately queue the next submission.
      }
    });
  },

  /**
   * Processes the successful response received from the code analysis server.
   * This involves clearing old diagnostics, displaying new issues, and updating the output area.
   * @param {string} responseData - The raw text content of the server's response.
   */
  handleAnalysisResponse: function(responseData) {
    // Sanitize the input: ensure responseData is a string, defaulting to empty if null/undefined.
    const processedOutput = responseData || '';

    // Remove any diagnostic markers (gutter icons, text highlights) from previous analyses.
    this.clearAllIssueMarkers();

    // Parse the analysis output and render any identified issues in the editor.
    this.displayAnalysisIssues(processedOutput);

    // Update the designated HTML element to show the raw analysis results to the user.
    jQuery('#analysisOutputDisplay').html(processedOutput);
  },

  /**
   * Manages errors encountered during the AJAX communication with the analysis service.
   * Provides user feedback and updates the application's communication status.
   * @param {jqXHR} jqXHR - The jQuery XMLHttpRequest object for the failed request.
   * @param {string} textStatus - A string detailing the type of error (e.g., "timeout", "error").
   * @param {string} errorThrown - An optional string or exception object, if an HTTP error occurred.
   */
  handleAnalysisError: function(jqXHR, textStatus, errorThrown) {
    console.error(`Code analysis request encountered an error: ${textStatus} - ${errorThrown}`);
    // If the error is a server-side issue (5xx status) or a timeout, mark communication as failed.
    if (jqXHR.status >= 500 || textStatus === 'timeout') {
      this.serverCommunicationFailed = true;
      jQuery('#analysisOutputDisplay').html('<div style="color: red; font-weight: bold;">Server communication failed. Please check your connection or try again later.</div>');
    } else {
      // For other client-side or network issues, display a warning.
      jQuery('#analysisOutputDisplay').html('<div style="color: orange;">Could not connect to the analysis service.</div>');
    }
    // Always clear any old markers when an error occurs to avoid stale diagnostics.
    this.clearAllIssueMarkers();
  },

  /**
   * Parses a given diagnostic trace string for error messages and renders them
   * as visual indicators within the CodeMirror editor.
   * @param {string} diagnosticTrace - The full string containing diagnostic messages from the backend.
   */
  displayAnalysisIssues: function(diagnosticTrace) {
    // Ensure all previous markers are removed before adding new ones.
    this.clearAllIssueMarkers();

    let currentIssueMatch;
    // Continuously search for patterns matching error messages in the diagnostic trace.
    while ((currentIssueMatch = this.issuePattern.exec(diagnosticTrace)) !== null) {
      // The regex captures 1-based line and column numbers. CodeMirror uses 0-based.
      const oneBasedLineNumber = parseInt(currentIssueMatch[1], 10);
      const oneBasedCharNumber = parseInt(currentIssueMatch[2], 10);

      // Validate the parsed line and character numbers to prevent invalid editor positions.
      if (isNaN(oneBasedLineNumber) || isNaN(oneBasedCharNumber) || oneBasedLineNumber < 1 || oneBasedCharNumber < 1) {
        console.warn('Skipping invalid error position found in diagnostic trace:', currentIssueMatch);
        continue; // Move to the next match if this one is invalid.
      }

      // Convert 1-based coordinates to CodeMirror's 0-based system.
      const editorPosition = {
        line: oneBasedLineNumber - 1,
        ch: oneBasedCharNumber - 1
      };

      // Add a visual error indicator to the gutter of the affected line.
      this.addGutterErrorIndicator(editorPosition.line);
      // Highlight the specific token (e.g., keyword, variable) that caused the issue.
      this.highlightIssueToken(editorPosition);
    }
  },

  /**
   * Places a custom marker icon in the CodeMirror gutter for a specified line number,
   * indicating a diagnostic issue on that line.
   * @param {number} lineNumber - The 0-based line number in the editor to mark.
   */
  addGutterErrorIndicator: function(lineNumber) {
    this.errorLineNumbers.push(lineNumber); // Record the line number for future reference.
    // Create a styled HTML span element to serve as the gutter marker.
    const markerDomElement = this.createStyledElement('span', 'cm-error-gutter-indicator', this.errorGutterSymbol);
    // Set the custom marker in the specified gutter for the given line.
    this.codeEditorInstance.setGutterMarker(lineNumber, "cm-diagnostic-gutter", markerDomElement);
  },

  /**
   * Removes all currently displayed diagnostic markers (gutter icons and text highlights)
   * from the CodeMirror editor, effectively clearing all error indications.
   */
  clearAllIssueMarkers: function() {
    // Clear all markers from the specific diagnostic gutter at once.
    this.codeEditorInstance.clearGutter("cm-diagnostic-gutter");
    this.errorLineNumbers = []; // Reset the array tracking marked lines.

    // Iterate through all stored text markers and clear each one individually.
    this.errorTextMarkers.forEach(function(marker) {
      if (marker && typeof marker.clear === 'function') {
        marker.clear(); // Call the clear method on the CodeMirror text marker object.
      }
    });
    this.errorTextMarkers = []; // Reset the array tracking text markers.
  },

  /**
   * Applies a visual highlight to a specific token within the editor at a given position.
   * This is typically used to draw attention to the exact part of the code causing an error.
   * @param {{line: number, ch: number}} position - The 0-based line and character position of the token to highlight.
   */
  highlightIssueToken: function(position) {
    // Retrieve detailed information about the token located at the specified position.
    const tokenInformation = this.codeEditorInstance.getTokenAt(position);

    // If no token is found at the position, or the token is empty (start == end),
    // then there's nothing meaningful to highlight, so we return.
    if (!tokenInformation || tokenInformation.start === tokenInformation.end) {
      return;
    }

    // Create a new text marker to highlight the token.
    const textMarker = this.codeEditorInstance.markText(
      { line: position.line, ch: tokenInformation.start }, // Start position of the token.
      { line: position.line, ch: tokenInformation.end },   // End position of the token.
      {
        className: "cm-error-token-highlight", // CSS class to apply for styling.
        atomic: false, // Allow cursor to move inside the marked text.
        inclusiveLeft: true, // Include characters to the left of the mark.
        inclusiveRight: true // Include characters to the right of the mark.
      }
    );
    this.errorTextMarkers.push(textMarker); // Store the marker for later removal.
  },

  /**
   * A utility function to create and configure a new HTML DOM element with a class and text content.
   * This simplifies the creation of elements like gutter markers.
   * @param {string} tagName - The HTML tag name for the element (e.g., 'div', 'span').
   * @param {string} className - The CSS class name(s) to assign to the element.
   * @param {string} textContent - The plain text content to place inside the element.
   * @returns {HTMLElement} The newly created and configured DOM element.
   */
  createStyledElement: function(tagName, className, textContent) {
    const newDomElement = document.createElement(tagName);
    newDomElement.className = className;
    newDomElement.textContent = textContent;
    return newDomElement;
  }
};