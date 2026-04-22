// Handlers for the external code inclusion process
let resourceReadyHandler = function() {
    // The external library's initialization might go here, e.g., setting an API key.
};

// Should the external resource fail to load
let resourceFaultHandler = function(issue) {
    if (typeof console !== 'undefined') {
        console.error(issue);
    }
};

// Constructing an HTML script element dynamically
let codeSnippet = document.createElement('script');

codeSnippet.type = 'text/javascript';
codeSnippet.src = '//api.filepicker.io/v1/filepicker.js';

codeSnippet.onload = resourceReadyHandler;
codeSnippet.onerror = resourceFaultHandler;

// Attaching the created element to the document's head
let documentHead = document.getElementsByTagName('head')[0];
documentHead.appendChild(codeSnippet);