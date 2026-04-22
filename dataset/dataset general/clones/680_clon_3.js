/*
 * Core application logic for markdown preview and file handling.
 * This script manages persistent storage, content rendering, and
 * user interaction for a markdown editor interface.
 */

// A utility object for interacting with the browser's local storage mechanism.
// It provides methods to persist and retrieve application-specific data.
const appPersistence = {
  // Fetches a value from local storage based on its designated key.
  retrieveItem: (storageKey) => {
    // Attempt to retrieve the value; returns null if not found.
    return localStorage.getItem(storageKey);
  },

  // Stores a given value into local storage under a specific key.
  storeItem: (storageKey, storedValue) => {
    // Update the local storage entry.
    localStorage.setItem(storageKey, storedValue);
    // Note: The original code had an unused 'data' object here. It's been removed
    // as it served no functional purpose.
  },

  // Verifies the presence of an item in local storage by its key.
  checkExistence: (storageKey) => {
    // A more concise way to check for existence compared to an if/else block.
    // Returns true if the key exists, false otherwise.
    return Object.prototype.hasOwnProperty.call(localStorage, storageKey);
  },

  // Removes a specific item from local storage using its key.
  deleteItem: (storageKey) => {
    // Remove the item from persistent storage.
    localStorage.removeItem(storageKey);
  },
};

/**
 * Processes changes from the editor instance, updates persistent storage,
 * and refreshes the rendered output display.
 * @param {object} currentEditorInstance - The CodeMirror editor instance.
 */
function processEditorChanges(currentEditorInstance) {
  // Ensure we have a valid editor instance to work with.
  if (!currentEditorInstance || typeof currentEditorInstance.getValue !== 'function') {
    console.warn("Invalid editor instance provided to processEditorChanges.");
    return;
  }

  // Retrieve the current textual content from the editor.
  const editorMarkdownContent = currentEditorInstance.getValue();

  // Persist the current content to local storage.
  // We stringify the content to ensure it's stored as a valid JSON string.
  appPersistence.storeItem('editor_state_content', JSON.stringify(editorMarkdownContent));

  // Update the visual output area with the new content.
  updateDisplayArea(editorMarkdownContent);
}

/**
 * Takes markdown content and renders it into the designated HTML display area.
 * @param {string} markdownSourceContent - The raw markdown text to be rendered.
 */
function updateDisplayArea(markdownSourceContent) {
  // Locate the output element.
  const outputElement = document.querySelector('#output-display');

  // Guard against missing output element or marked library.
  if (!outputElement || typeof marked === 'undefined') {
    console.error("Output display element or 'marked' library not found.");
    return;
  }

  // Render the markdown content to HTML and set it as the inner HTML.
  outputElement.innerHTML = marked(markdownSourceContent);
}

/**
 * Initiates the download of the current editor content as a markdown file.
 */
function initiateDocumentDownload() {
  // Get the complete text from the active editor.
  const documentPlainText = mainTextEditor.getValue();

  // Validate that there is content to save.
  if (!documentPlainText || documentPlainText.trim().length === 0) {
    console.info("No content to save. Download aborted.");
    // Optionally, show a user notification.
    return;
  }

  // Define the MIME type for plain text files.
  const fileMimeType = 'text/plain';

  // Create a Blob object containing the editor's content.
  const fileDataBlob = new Blob([documentPlainText], { type: fileMimeType });

  // Proceed with the actual file download operation.
  triggerFileSave(fileDataBlob);
}

/**
 * Handles the cross-browser logic for saving a Blob object as a file.
 * @param {Blob} contentBlob - The Blob object representing the file data.
 */
function triggerFileSave(contentBlob) {
  // Default filename for the downloaded content.
  const defaultFileName = "document.md";

  // Attempt to use window.saveAs (FileSaver.js polyfill).
  if (window.saveFileAs) {
    window.saveFileAs(contentBlob, defaultFileName);
  }
  // Fallback for navigator.saveBlob (older browser implementations).
  else if (navigator.saveBinaryData) {
    navigator.saveBinaryData(contentBlob, defaultFileName);
  }
  // Generic fallback for browsers that don't support the above directly.
  else {
    // Create a temporary URL for the Blob.
    const tempObjectUrl = browserURLUtils.createObjectURL(contentBlob);
    // Create a hidden anchor element.
    const downloadLink = document.createElement("a");

    // Set attributes for the download link.
    downloadLink.setAttribute("href", tempObjectUrl);
    downloadLink.setAttribute("download", defaultFileName);

    // Programmatically trigger a click event on the link to initiate download.
    // This is a common workaround for browsers without direct save functionality.
    const clickSimulationEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    downloadLink.dispatchEvent(clickSimulationEvent);

    // Revoke the object URL to free up resources after a short delay.
    // This is important for memory management, especially for large files.
    setTimeout(() => browserURLUtils.revokeObjectURL(tempObjectUrl), 60 * 1000); // Revoke after 1 minute
  }
}

// Global variable for URL utilities, handling vendor prefixes.
const browserURLUtils = window.URL || window.webkitURL || window.mozURL || window.msURL;

// Polyfill for navigator.saveBlob and window.saveAs to ensure broader compatibility.
// These are often provided by external libraries like FileSaver.js.
navigator.saveBinaryData = navigator.saveBinaryData || navigator.msSaveBlob || navigator.mozSaveBlob || navigator.webkitSaveBlob;
window.saveFileAs = window.saveFileAs || window.webkitSaveAs || window.mozSaveAs || window.msSaveAs;

// Listen for keyboard input events across the document.
document.addEventListener('keydown', (keyboardEvent) => {
  // Check for 'Ctrl + S' or 'Cmd + S' (for macOS).
  const isSaveCombination = keyboardEvent.code === 'KeyS' && (keyboardEvent.ctrlKey || keyboardEvent.metaKey);

  if (isSaveCombination) {
    keyboardEvent.preventDefault(); // Prevent default browser save dialog.
    initiateDocumentDownload();     // Trigger our custom save function.
    // The original code included 'return false;' which is not standard
    // for modern event handlers; preventDefault() is sufficient.
  }
});

// Listen for file drop events on the document body.
document.addEventListener('drop', (dropEvent) => {
  dropEvent.preventDefault(); // Prevent default browser behavior (e.g., opening file).
  dropEvent.stopPropagation(); // Stop event propagation.

  // Check if any files were dropped.
  if (!dropEvent.dataTransfer || !dropEvent.dataTransfer.files || dropEvent.dataTransfer.files.length === 0) {
    console.warn("No files were dropped or dataTransfer is invalid.");
    return;
  }

  // Get the first dropped file.
  const droppedFile = dropEvent.dataTransfer.files[0];

  // Ensure the file is a text-based file.
  if (!droppedFile.type.startsWith('text/') && !droppedFile.name.endsWith('.md')) {
    console.warn("Dropped file is not a recognized text or markdown file type.");
    // Optionally, provide user feedback.
    return;
  }

  // Initialize a FileReader to read the file's content.
  const fileReaderInstance = new FileReader();

  // Define the onload event handler for the FileReader.
  fileReaderInstance.onload = (readEvent) => {
    // Set the editor's value to the content of the dropped file.
    if (mainTextEditor && readEvent.target && readEvent.target.result) {
      mainTextEditor.setValue(readEvent.target.result);
    } else {
      console.error("Failed to load file content into editor.");
    }
  };

  // Define an onerror event handler for potential reading errors.
  fileReaderInstance.onerror = (errorEvent) => {
    console.error("Error reading dropped file:", errorEvent);
  };

  // Read the file as plain text.
  fileReaderInstance.readAsText(droppedFile);
}, false); // The 'false' parameter specifies event capturing phase (bubbling in this case).

// Configure the 'marked' library for markdown rendering.
// Specifically, enable syntax highlighting using highlight.js.
marked.setOptions({
  highlight: (rawCodeBlock) => {
    // Attempt to automatically detect and highlight the language.
    // If hljs is not available, this might throw an error or return rawCodeBlock.
    try {
      return hljs.highlightAuto(rawCodeBlock).value;
    } catch (error) {
      console.error("Highlight.js error during code block highlighting:", error);
      return rawCodeBlock; // Return original code if highlighting fails.
    }
  },
  gfm: true, // Enable GitHub Flavored Markdown
  breaks: true, // Enable GFM line breaks
});

// Define common CodeMirror editor configuration options.
const editorConfig = {
  mode: 'gfm',          // GitHub Flavored Markdown mode.
  lineNumbers: true,    // Display line numbers.
  matchBrackets: true,  // Highlight matching brackets.
  lineWrapping: true,   // Wrap long lines.
  theme: 'default',     // Editor theme.
  tabSize: 2,           // Tab size for indentation.
  indentWithTabs: false, // Use spaces instead of tabs.
};

// Global variable for the CodeMirror editor instance.
let mainTextEditor;

// Determine the initial content for the editor.
let initialEditorContent = '';
const storedContentKey = 'editor_state_content';

if (appPersistence.checkExistence(storedContentKey)) {
  try {
    // Retrieve and parse the stored content.
    const retrievedRawContent = appPersistence.retrieveItem(storedContentKey);
    initialEditorContent = JSON.parse(retrievedRawContent);
  } catch (parseError) {
    console.error("Error parsing stored editor content, using empty string.", parseError);
    // If parsing fails, perhaps due to corrupted storage, reset it.
    appPersistence.deleteItem(storedContentKey);
    initialEditorContent = '';
  }
}

// Select the target element for the editor.
// Assuming an element with id 'editor-container' exists for CodeMirror to attach to.
const editorTargetElement = document.querySelector('#editor-container') || document.body;

// Initialize the CodeMirror editor.
// If there's stored content, use it; otherwise, initialize with an empty value.
mainTextEditor = CodeMirror(editorTargetElement, {
  value: initialEditorContent,
  ...editorConfig, // Spread common configuration.
});


// If a specific textarea with ID 'source-textarea' was intended for CodeMirror.
// This block handles the alternative initialization from a textarea,
// which was present in the original code's else branch.
const fallbackTextarea = document.getElementById('source-textarea');
if (!mainTextEditor && fallbackTextarea) {
  mainTextEditor = CodeMirror.fromTextArea(fallbackTextarea, editorConfig);
  // Set initial content if it wasn't set by the direct CodeMirror constructor.
  if (initialEditorContent && mainTextEditor.getValue() === '') {
      mainTextEditor.setValue(initialEditorContent);
  }
} else if (!mainTextEditor) {
    console.error("CodeMirror editor could not be initialized. No suitable target element found.");
}


// Perform an initial update to render the content immediately.
if (mainTextEditor) {
  processEditorChanges(mainTextEditor);

  // Attach an event listener to the editor for changes.
  // This ensures the preview is updated in real-time.
  mainTextEditor.on('change', processEditorChanges);

  // Set focus to the editor when the page loads, for immediate user input.
  mainTextEditor.focus();
}