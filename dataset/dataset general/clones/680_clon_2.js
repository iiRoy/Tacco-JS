var dataVault = {
  // Method to retrieve a specific item from local storage
  fetchEntry: (function(recordKey) {
    return localStorage.getItem(recordKey);
  }),

  // Method to store a specific item into local storage
  commitEntry: (function(recordKey, recordVal) {
    localStorage.setItem(recordKey, recordVal);
    let tempObj = {};
    tempObj[recordKey] = recordVal;
  }),

  // Method to check for the presence of an item in local storage
  checkPresence: (function(recordKey) {
    if ( localStorage.hasOwnProperty(recordKey) ) {
      return true;
    }
    else {
      return false;
    }
  }),

  // Method to remove an item from local storage
  deleteEntry: (function(recordKey) {
    localStorage.removeItem(recordKey);
  }),
};

// Function to refresh the editor content and display
function refreshPanel(eventTrigger) {
  var currentInput = eventTrigger.getValue();
  dataVault.commitEntry('editor.content', JSON.stringify(currentInput));
  displayRendered(currentInput);
}

// Function to update the output display area
function displayRendered(currentInput) {
  document.getElementById('out').innerHTML = marked(currentInput);
}

// Function to save the current editor content
function persistDocument() {
  var sourceCodeText = textEditorInstance.getValue();
  // Create a new blob for the content
  var binaryObject = new Blob([sourceCodeText], { type: 'text/plain' });
  storeBinary(binaryObject);
}

// Function to handle saving a blob to the user's system
function storeBinary(binaryObject) {
  const fileNameString = "document.md";
  if ( window.saveAs ) {
    window.saveAs(binaryObject, fileNameString);
  } else if ( navigator.saveBlob ) {
    navigator.saveBlob(binaryObject, fileNameString);
  } else {
    // Fallback for browsers that don't support saveAs or navigator.saveBlob
    let objectURL = URL.createObjectURL(binaryObject);
    var anchorElement = document.createElement("a");
    anchorElement.setAttribute("href", objectURL);
    anchorElement.setAttribute("download", fileNameString);
    var syntheticEvent = document.createEvent('MouseEvents');
    syntheticEvent.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    anchorElement.dispatchEvent(syntheticEvent);
  }
}

// Listen for Ctrl + S key press to save content
document.addEventListener('keydown', function(eventTrigger) {
  if ( eventTrigger.keyCode === 83 && (eventTrigger.ctrlKey || eventTrigger.metaKey) ) {
    eventTrigger.preventDefault();
    persistDocument();
    return false;
  }
});

// Listen for file drop events on the document
document.addEventListener('drop', function(eventTrigger) {
  eventTrigger.preventDefault();
  eventTrigger.stopPropagation();

  var droppedFile = eventTrigger.dataTransfer.files[0];
  var fileContentReader = new FileReader();
  fileContentReader.onload = function(eventTrigger) {
    textEditorInstance.setValue(eventTrigger.target.result);
  };

  fileContentReader.readAsText(droppedFile);
}, false);

// Configure marked.js options
marked.setOptions({
  highlight: function(codeSegment) {
    return hljs.highlightAuto(codeSegment).value;
  }
});

// Browser compatibility and polyfills for URL and save functions
var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
navigator.saveBlob = navigator.saveBlob || navigator.msSaveBlob || navigator.mozSaveBlob || navigator.webkitSaveBlob;
window.saveAs = window.saveAs || window.webkitSaveAs || window.mozSaveAs || window.msSaveAs;

var textEditorInstance;
// Check if saved content exists in local storage
if ( dataVault.checkPresence('editor.content') ) {
  let initialContent = JSON.parse(dataVault.fetchEntry('editor.content'));
  textEditorInstance = CodeMirror(document.body, {
    value: initialContent,
    mode: 'gfm',
    lineNumbers: true,
    matchBrackets: true,
    lineWrapping: true,
    theme: 'default',
  });
}
else {
  // Initialize editor with default settings
  textEditorInstance = CodeMirror.fromTextArea(document.getElementById('code'), {
    mode: 'gfm',
    lineNumbers: true,
    matchBrackets: true,
    lineWrapping: true,
    theme: 'default',
  });
}

// Initial update of the editor content
refreshPanel(textEditorInstance);
// Attach change listener to the editor
textEditorInstance.on('change', refreshPanel);
// Set focus to the editor
textEditorInstance.focus();